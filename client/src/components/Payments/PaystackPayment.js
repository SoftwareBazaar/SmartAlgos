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

    // Fetch public key if missing when component mounts
    useEffect(() => {
        const fetchConfig = async () => {
            if (!paymentConfig.publicKey) {
                try {
                    const response = await axios.get('/api/payments/paystack/config', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (response.data.success && response.data.publicKey) {
                        setPaymentConfig(prev => ({ ...prev, publicKey: response.data.publicKey }));
                    }
                } catch (err) {
                    console.error('Failed to fetch Paystack config:', err);
                }
            }
        };
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen]);

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
                '/api/payments/paystack/initialize', // Updated route
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

                setPaymentConfig(prev => ({
                    ...prev,
                    reference: response.data.payment.reference,
                    email: userEmail,
                    amount: calculateAmount(subscriptionType) * 100, // Convert to kobo
                    metadata: {
                        ea_name: ea.name,
                        subscription_type: subscriptionType
                    }
                }));

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
                `/api/payments/paystack/verify/${reference.reference}`, // Updated route
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#0f172a' }}>Checkout</h3>

                {/* EA Details */}
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
                                ${calculateAmount(subscriptionType)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2" style={{ color: '#be123c' }}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Missing Public Key Warning (Debug only) */}
                {!paymentConfig.publicKey && !isProcessing && (
                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg mb-6 text-xs italic" style={{ color: '#92400e' }}>
                        Initializing secure payment environment...
                    </div>
                )}

                {/* Loading State */}
                {isProcessing && !paymentConfig.reference && (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
                        <span className="font-medium text-sm" style={{ color: '#475569' }}>Initializing payment...</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            if (paymentConfig.reference && paymentConfig.publicKey) {
                                initializePaystackPayment(
                                    handlePaystackSuccess,
                                    handlePaystackClose
                                );
                            }
                        }}
                        disabled={isProcessing || !paymentConfig.reference || !paymentConfig.publicKey}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Processing...</>
                        ) : 'Pay with Paystack'}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full py-3 font-semibold hover:text-slate-800 transition-colors"
                        style={{ color: '#64748b' }}
                    >
                        Cancel
                    </button>
                </div>

                <div className="flex items-center justify-center mt-6 pt-4 border-t border-slate-100">
                    <img src="https://paystack.com/assets/img/login/paystack-logo.png" alt="Paystack" className="h-4 opacity-50 contrast-0" />
                </div>
            </div>
        </div>
    );
};

export default PaystackPayment;
