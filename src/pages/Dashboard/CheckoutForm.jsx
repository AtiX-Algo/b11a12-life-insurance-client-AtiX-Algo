import React, { useState, useEffect, useContext } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAxiosSecure from '../../api/axiosSecure';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutForm = ({ price, policyTitle }) => {
    const stripe = useStripe();
    const elements = useElements();
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);
    const [clientSecret, setClientSecret] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (price > 0) {
            axiosSecure.post('/create-payment-intent', { price })
                .then(res => setClientSecret(res.data.clientSecret));
        }
    }, [price, axiosSecure]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        const card = elements.getElement(CardElement);
        if (card == null) return;

        const { error: paymentMethodError } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });
        if (paymentMethodError) {
            toast.error(paymentMethodError.message);
            setProcessing(false);
            return;
        }

        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: { name: user?.displayName || 'anonymous', email: user?.email || 'unknown' },
            },
        });

        if (confirmError) {
            toast.error(confirmError.message);
            setProcessing(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            const payment = {
                email: user.email,
                price: price,
                transactionId: paymentIntent.id,
                date: new Date(),
                status: 'paid'
            };
            axiosSecure.post('/payments', payment).then(res => {
                if (res.data._id) {
                    toast.success(`Payment for ${policyTitle} successful!`);
                }
            });
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            <button type="submit" disabled={!stripe || !clientSecret || processing} className="btn btn-primary btn-block mt-6">
                {processing ? 'Processing...' : `Pay $${price}`}
            </button>
        </form>
    );
};

export default CheckoutForm;