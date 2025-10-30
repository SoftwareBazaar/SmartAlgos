import React from 'react';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft } from 'lucide-react';

const PaymentResultDialog = ({
  isOpen,
  status = 'success', // 'success' | 'failed'
  title,
  message,
  onClose,
  onDownload,
  onViewSubscription,
  primaryLabel
}) => {
  if (!isOpen) return null;

  const isSuccess = status === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;
  const color = isSuccess ? 'green' : 'red';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className={`flex items-center p-4 border-b ${isSuccess ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
          <Icon className={`h-6 w-6 mr-2 text-${color}-600`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title || (isSuccess ? 'Payment Successful' : 'Payment Failed')}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {message && (
            <p className={`text-sm ${isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{message}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {isSuccess && onDownload && (
              <button
                onClick={onDownload}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {primaryLabel || 'Download'}
              </button>
            )}
            {onViewSubscription && (
              <button
                onClick={onViewSubscription}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Subscription
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultDialog;


