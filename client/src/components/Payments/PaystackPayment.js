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
    const [paymentConfig, setPaymentConfig] = useState({
        reference: '',
        email: '',
        amount: 0,
        publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '',
        metadata: {}
    });

    // Initialize payment when dialog opens
    useEffect(() => {
        if (isOpen && ea) {
            initializePayment();
        }
    }, [isOpen, ea, subscriptionType]);

    // Initialize Paystack payment
    const initializePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            console.log('💳 Initializing Paystack payment...');

            // Get user email from localStorage or state
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

                // Store payment info for verification later
                const paymentInfo = {
                    reference: response.data.payment.reference,
                    paymentId: response.data.payment.id
                };

                setPaymentConfig({
                    reference: response.data.payment.reference,
                    email: userEmail,
                    amount: calculateAmount(subscriptionType) * 100, // Convert to kobo
                    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
                    metadata: {
                        ea_name: ea.name,
                        subscription_type: subscriptionType
                    }
                });

                // Store for later verification
                localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo));
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

    // Calculate amount based on subscription type
    const calculateAmount = (type) => {
        const prices = {
            weekly: ea.price_weekly,
            monthly: ea.price_monthly,
            quarterly: ea.price_quarterly,
            yearly: ea.price_yearly
        };
        return prices[type] || ea.price_monthly;
    };

    // Handle successful payment
    const handlePaystackSuccess = async (reference) => {
        console.log('✅ Paystack payment successful:', reference);

        setIsProcessing(true);

        try {
            // Verify payment with backend
            const response = await axios.get(
                `/api/payments/paystack/verify/${reference.reference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('📥 Verification response:', response.data);

            if (response.data.success) {
                // Clear pending payment
                localStorage.removeItem('pendingPayment');

                // Close payment dialog
                onClose();

                // Trigger success callback with download links
                onPaymentSuccess({
                    subscription: response.data.subscription,
                    downloadLinks: response.data.downloadLinks,
                    message: 'Payment successful! Your files are downloading...'
                });
            } else {
                setError(response.data.message || 'Payment verification failed');
            }

        } catch (error) {
            console.error('❌ Verification error:', error);
            setError('Failed to verify payment. Please contact support.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle payment closure
    const handlePaystackClose = () => {
        console.log('⚠️ Paystack payment closed');
        setError('Payment was cancelled');
    };

    // Initialize Paystack hook
    const initializePaystackPayment = usePaystackPayment(paymentConfig);

    // Render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Complete Your Payment</h3>

                {/* EA Details */}
                {ea && (
                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <p className="text-sm text-gray-600">Subscribing to:</p>
                        <p className="text-lg font-bold">{ea.name}</p>
                        <p className="text-sm text-gray-600 mt-2">Subscription Type:</p>
                        <p className="text-lg font-bold capitalize">{subscriptionType}</p>
                        <p className="text-sm text-gray-600 mt-2">Amount:</p>
                        <p className="text-2xl font-bold text-green-600">
                            ${calculateAmount(subscriptionType)}
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Missing Public Key Warning */}
                {!paymentConfig.publicKey && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4 text-xs">
                        ⚠️ <strong>Configuration Error:</strong> Paystack Public Key is missing.
                        Please set <code>REACT_APP_PAYSTACK_PUBLIC_KEY</code> in your environment.
                    </div>
                )}

                {/* Loading State */}
                {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="ml-3 text-gray-600">Processing...</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (paymentConfig) {
                                initializePaystackPayment(
                                    handlePaystackSuccess,
                                    handlePaystackClose
                                );
                            }
                        }}
                        disabled={isProcessing || !paymentConfig.reference || !paymentConfig.publicKey}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {!paymentConfig.reference ? 'Initializing...' : (isProcessing ? 'Processing...' : 'Pay with Paystack')}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-6 py-3 border border-gray-300 rounded font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Secure payment powered by Paystack
                </p>
            </div>
        </div>
    );
};

export default PaystackPayment;
