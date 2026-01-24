import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePaystackPayment } from 'react-paystack';

const PaystackPayment = ({
    isOpen,
    onClose,
    ea,
    subscriptionType,
    onPaymentSuccess
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [publicKey, setPublicKey] = useState(process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '');

    // Fetch public key if missing when component mounts
    useEffect(() => {
        const fetchConfig = async () => {
            if (!publicKey) {
                try {
                    const response = await axios.get('/api/payments/paystack/config', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (response.data.success && response.data.publicKey) {
                        setPublicKey(response.data.publicKey);
                    }
                } catch (err) {
                    console.error('Failed to fetch Paystack config:', err);
                }
            }
        };
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen, publicKey]);

    // Initialize payment when dialog opens
    useEffect(() => {
        if (isOpen && ea) {
            initializePayment();
        }
    }, [isOpen, ea, subscriptionType]);

    // Initialize Paystack payment on the backend
    const initializePayment = async () => {
        setIsProcessing(true);
        setError(null);
        setPaymentData(null);

        try {
            console.log('💳 Initializing Paystack payment...');

            const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

            const response = await axios.post(
                '/api/payments/paystack/initialize',
                {
                    eaId: ea.id,
                    subscriptionType: subscriptionType,
                    email: userEmail
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                console.log('✅ Payment initialized:', response.data.payment);
                setPaymentData(response.data.payment);

                // Track for verification
                localStorage.setItem('pendingPaymentRef', response.data.payment.reference);
            } else {
                setError(response.data.error || 'Failed to initialize payment');
            }

        } catch (error) {
            console.error('❌ Initialize payment error:', error);
            setError(error.response?.data?.error || 'Failed to initialize payment');
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate amount for UI display only
    const calculateDisplayAmount = () => {
        const prices = {
            weekly: ea.price_weekly || ea.weekly_price,
            monthly: ea.price_monthly || ea.monthly_price,
            quarterly: ea.price_quarterly || ea.quarterly_price,
            yearly: ea.price_yearly || ea.yearly_price
        };
        return prices[subscriptionType] || ea.price_monthly || 0;
    };

    // Success Handler
    const onSuccess = (reference) => {
        console.log('✅ Paystack payment successful:', reference);
        verifyPayment(reference.reference);
    };

    // Close Handler
    const onClosing = () => {
        console.log('⚠️ Paystack payment closed');
        // Reset payment data and re-initialize to ensure a fresh reference for the next attempt
        initializePayment();
    };

    // Verification Logic
    const verifyPayment = async (reference) => {
        setIsProcessing(true);
        try {
            const response = await axios.get(
                `/api/payments/paystack/verify/${reference}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.data.success) {
                localStorage.removeItem('pendingPaymentRef');
                onClose();
                onPaymentSuccess({
                    subscription: response.data.subscription,
                    downloadLinks: response.data.downloadLinks,
                    message: 'Payment successful! Your files are ready.'
                });
            } else {
                setError('Payment verification failed. Please contact support.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Error verifying payment.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Config for the Paystack Hook
    const config = {
        reference: paymentData?.reference,
        email: localStorage.getItem('userEmail') || 'user@example.com',
        amount: Math.round(calculateDisplayAmount() * 150 * 100), // Convert to KES kobo (Matching backend 150 rate)
        publicKey: publicKey,
        currency: 'KES',
        metadata: {
            ea_name: ea?.name,
            subscription_type: subscriptionType
        }
    };

    const initializePaystackPayment = usePaystackPayment(config);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#0f172a' }}>Checkout</h3>

                {ea && (
                    <div className="bg-slate-50 p-5 rounded-lg mb-6 border border-slate-100">
                        <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#64748b' }}>Subscribing to:</p>
                        <p className="text-lg font-bold line-clamp-2" style={{ color: '#1e293b' }}>{ea.name}</p>

                        <div className="flex justify-between mt-4 pb-2 border-b border-slate-200">
                            <span className="text-sm" style={{ color: '#475569' }}>Subscription Type:</span>
                            <span className="text-sm font-bold capitalize" style={{ color: '#1e293b' }}>{subscriptionType}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span className="text-sm" style={{ color: '#475569' }}>Total Amount:</span>
                            <span className="text-2xl font-black" style={{ color: '#059669' }}>
                                ${calculateDisplayAmount()}
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 border border-rose-200 px-4 py-3 rounded-lg mb-6 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            if (paymentData && publicKey) {
                                initializePaystackPayment(onSuccess, onClosing);
                            }
                        }}
                        disabled={isProcessing || !paymentData || !publicKey}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Initializing...</>
                        ) : 'Pay with Paystack'}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full py-3 font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <div className="flex items-center justify-center mt-6 pt-4 border-t border-slate-100">
                    <img src="https://paystack.com/assets/img/login/paystack-logo.png" alt="Paystack" className="h-4 opacity-50" />
                </div>
            </div>
        </div>
    );
};

export default PaystackPayment;
