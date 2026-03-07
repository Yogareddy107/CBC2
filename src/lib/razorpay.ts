import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RazorpaySubscriptionOptions {
  plan_id: string;
  customer_id: string;
  quantity?: number;
  total_count?: number;
  start_at?: number;
}

export interface RazorpayPaymentOptions {
  amount: number; // in paise (e.g., 100 = ₹1)
  currency?: string;
  receipt?: string;
}

/**
 * Create a Razorpay customer
 */
export async function createRazorpayCustomer(email: string, name?: string) {
  try {
    const customer = await razorpay.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error('Error creating Razorpay customer:', error);
    throw error;
  }
}

/**
 * Create a Razorpay subscription
 */
export async function createRazorpaySubscription(options: RazorpaySubscriptionOptions) {
  try {
    // razorpay typings are a bit narrow; cast to any to avoid property errors
    const subscription = await razorpay.subscriptions.create({
      plan_id: options.plan_id,
      customer_id: options.customer_id,
      quantity: options.quantity || 1,
      total_count: options.total_count || 12, // 12 months by default
      start_at: options.start_at,
    } as any);
    return subscription;
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    throw error;
  }
}

/**
 * Fetch subscription details
 */
export async function getRazorpaySubscription(subscriptionId: string) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error fetching Razorpay subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelRazorpaySubscription(subscriptionId: string) {
  try {
    const result = await razorpay.subscriptions.cancel(subscriptionId);
    return result;
  } catch (error) {
    console.error('Error canceling Razorpay subscription:', error);
    throw error;
  }
}

// alias for older imports (build error indicated missing cancelSubscription export)
export const cancelSubscription = cancelRazorpaySubscription;

/**
 * Create a payment order (for one-time payments)
 */
export async function createRazorpayOrder(options: RazorpayPaymentOptions) {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
    });
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Verify payment signature for client-side redirection
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest('hex');
    return digest === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
}

/**
 * Verify webhook signature from Razorpay headers
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay webhook signature:', error);
    return false;
  }
}
