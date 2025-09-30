import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../../pages/Dashboard/CheckoutForm.jsx';
import { Helmet } from 'react-helmet-async';

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
    // In a real app, you would use useParams to get the policy ID and fetch its details,
    // including the price. For now, we'll use a fixed price.
    const premiumPrice = 120; // Example price
    const policyTitle = "Example Policy";

    return (
        <div>
            <Helmet><title>Dashboard | Payment</title></Helmet>
            <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>
            <div className="max-w-md mx-auto p-8 bg-base-200 rounded-lg">
                <Elements stripe={stripePromise}>
                    <CheckoutForm price={premiumPrice} policyTitle={policyTitle} />
                </Elements>
            </div>
        </div>
    );
};

export default Payment;