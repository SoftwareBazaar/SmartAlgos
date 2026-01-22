import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PaymentResultDialog from '../../components/Payments/PaymentResultDialog';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(true);
    const [result, setResult] = useState(null);
    const [showResultDialog, setShowResultDialog] = useState(false);

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            // Get reference from URL
            const reference = searchParams.get('reference') || searchParams.get('trxref');

            if (!reference) {
                setResult({
                    success: false,
                    message: 'No payment reference found'
                });
                setShowResultDialog(true);
                setIsVerifying(false);
                return;
            }

            console.log('🔍 Verifying payment:', reference);

            // Verify with backend
            const response = await axios.get(
                `/api/payments/paystack/verify/${reference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('✅ Verification complete:', response.data);

            if (response.data.success) {
                // Payment successful
                setResult({
                    success: true,
                    message: response.data.message || 'Payment successful! Your files are downloading...',
                    subscription: response.data.subscription,
                    downloadLinks: response.data.downloadLinks
                });
            } else {
                // Payment failed
                setResult({
                    success: false,
                    message: response.data.message || 'Payment verification failed'
                });
            }

            // Clear pending payment from localStorage
            localStorage.removeItem('pendingPayment');

        } catch (error) {
            console.error('❌ Verification error:', error);

            setResult({
                success: false,
                message: error.response?.data?.error || 'Failed to verify payment'
            });
        } finally {
            setIsVerifying(false);
            setShowResultDialog(true);
        }
    };

    const handleDialogClose = () => {
        setShowResultDialog(false);

        // Redirect based on success
        if (result?.success) {
            navigate('/subscription');
        } else {
            navigate('/ea-marketplace');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            {isVerifying ? (
                // Loading state
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full mx-4 text-center">
                    <div className="mb-4">
                        <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Verifying Payment</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please wait while we confirm your payment...</p>
                </div>
            ) : (
                // Result dialog
                <PaymentResultDialog
                    isOpen={showResultDialog}
                    onClose={handleDialogClose}
                    status={result?.success ? 'success' : 'failed'}
                    message={result?.message}
                    downloadLinks={result?.downloadLinks}
                    subscriptionId={result?.subscription?.id}
                    onViewSubscription={() => navigate('/subscription')}
                />
            )}
        </div>
    );
};

export default PaymentCallback;
