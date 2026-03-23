"use client";

import { useState } from 'react';

export default function PlanActions({ userId, currentSub, planId = 'pro_monthly', label = 'Upgrade to Professional Plan — $12 / month' }: { userId: string; currentSub: { plan: string; status: string } | null; planId?: string; label?: string }) {
    const [loading, setLoading] = useState(false);

    async function loadScript(src: string) {
        return new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load script'));
            document.body.appendChild(script);
        });
    }

    async function handleUpgrade() {
        setLoading(true);
        try {
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, plan: planId }),
            });
            if (!res.ok) throw new Error('Create order failed');
            const data = await res.json();

            await loadScript('https://checkout.razorpay.com/v1/checkout.js');

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'CheckBeforeCommit',
                description: 'Pro Subscription',
                order_id: data.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                userId,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            window.location.reload();
                        } else {
                            alert(verifyData?.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Payment verification error');
                    }
                },
                prefill: { email: '' },
            };

            // @ts-ignore
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert('Unable to start checkout');
        } finally {
            setLoading(false);
        }
    }

    if (currentSub) {
        return (
            <div className="flex items-center justify-center gap-4">
                <a href="/dashboard/plan/manage" className="px-6 py-3 border rounded-md">Manage Subscription</a>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            <button onClick={handleUpgrade} disabled={loading} className="px-8 py-3 bg-primary text-white rounded-md">
                {loading ? 'Processing…' : label}
            </button>
        </div>
    );
}
