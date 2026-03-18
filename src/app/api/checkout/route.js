import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  // Gracefully handle missing Stripe config
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Check back soon!" },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user already has an active subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription.", alreadyActive: true },
        { status: 400 }
      );
    }

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
