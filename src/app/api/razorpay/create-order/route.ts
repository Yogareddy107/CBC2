import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { createRazorpayOrder } from '@/lib/razorpay';
import { rateLimit } from '@/lib/rate-limit';

// Plan pricing in INR
const PLAN_PRICING = {
  pro_monthly: 1299, // ₹1299 (~$15)
  pro_yearly: 11999, // ₹11,999 (~$144 or $12/mo)
  team_monthly: 3299, // ₹3299 (~$39)
  team_yearly: 31999, // ₹31,999 (~$384 or $32/mo)
};

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = rateLimit(`razorpay-order-${ip}`, 10, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    const { userId, plan = 'pro_monthly' } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user session
    try {
      const { account } = await createSessionClient();
      const user = await account.get();

      const email = user.email || 'customer@example.com';
      const name = user.name || 'Customer';

      // Get plan amount
      const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING] || PLAN_PRICING.pro_monthly;

      // Create Razorpay order (amount in paise)
      const order = await createRazorpayOrder({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order-${userId}-${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
