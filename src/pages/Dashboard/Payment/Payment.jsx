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

    // Only show test card info in development (Vite sets import.meta.env.DEV)
    const showTestCard = Boolean(import.meta.env.DEV);

    // Optional: pass this object into CheckoutForm if you implement prefill/testing
    const testCardDetails = {
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/34',
        cvc: '123',            // 4 digits for Amex if you want e.g. '1234'
        zip: '12345',
        notes:
            'Use the above card number + future expiry + any CVC and ZIP for interactive testing in dev.'
    };

    return (
        <div>
            <Helmet>
                <title>Dashboard | Payment</title>
            </Helmet>

            <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>

            <div className="max-w-md mx-auto p-8 bg-base-200 rounded-lg space-y-6">
                {showTestCard && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="border border-dashed p-4 rounded-md"
                    >
                        <strong className="block mb-2">Test card (development only)</strong>
                        <ul className="text-sm space-y-1">
                            <li>Card number: <code>4242 4242 4242 4242</code></li>
                            <li>Expiry: <code>12/34</code> (use any valid future date)</li>
                            <li>CVC: <code>123</code> (or 4 digits for AmEx)</li>
                            <li>ZIP: <code>12345</code></li>
                            <li>Enter any values for other form fields.</li>
                        </ul>
                        
                    </div>
                )}

                <Elements stripe={stripePromise}>
                    {/* 
                        CheckoutForm may accept a prop like `testCardDetails` to prefill fields for testing.
                        If CheckoutForm doesn't support it yet, pass it anyway or remove the prop.
                    */}
                    <CheckoutForm
                        price={premiumPrice}
                        policyTitle={policyTitle}
                        // optional prop — implement prefill inside CheckoutForm if desired
                        testCardDetails={testCardDetails}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default Payment;
