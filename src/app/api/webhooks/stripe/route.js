import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, createCheckoutSession } from "@/lib/stripe";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// Webhook handler — receives events from Stripe
export async function POST(request) {
  const body = await request.text();
  const headersList = headers();

  // Check if this is a checkout creation request (from our frontend)
  const contentType = headersList.get("content-type");
  if (contentType === "application/json") {
    return handleCheckoutRequest(body);
  }

  // Otherwise, it's a Stripe webhook
  const sig = headersList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const status = subscription.status === "active" ? "active" : "past_due";

      await supabase
        .from("profiles")
        .update({ subscription_status: status })
        .eq("stripe_customer_id", subscription.customer);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase
        .from("profiles")
        .update({ subscription_status: "cancelled" })
        .eq("stripe_customer_id", subscription.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Handle checkout session creation from frontend
async function handleCheckoutRequest(body) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
  }
}
