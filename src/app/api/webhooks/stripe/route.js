import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe as getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request) {
  // If Stripe isn't configured, return early
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
  }

  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();

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