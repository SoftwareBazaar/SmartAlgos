import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Download, FileText, ArrowLeft } from 'lucide-react';
import useAutoDownload from '../../hooks/useAutoDownload';

const PaymentResultDialog = ({
  isOpen,
  status = 'success', // 'success' | 'failed'
  title,
  message,
  onClose,
  onDownload,
  onViewSubscription,
  primaryLabel,
  downloadLinks, // New prop: download links object
  subscriptionId, // New prop: subscription ID
  autoDownload = true // New prop: whether to trigger auto-download on mount
}) => {
  const { downloading, progress, downloadFromLinks } = useAutoDownload();

  // Auto-trigger downloads when dialog opens with success status
  useEffect(() => {
    if (isOpen && status === 'success' && downloadLinks && autoDownload) {
      console.log('🚀 Auto-triggering downloads from PaymentResultDialog...');
      handleAutoDownload();
    }
  }, [isOpen, status, downloadLinks, autoDownload]);

  const handleAutoDownload = async () => {
    if (!downloadLinks) {
      console.warn('No download links available');
      return;
    }

    try {
      const result = await downloadFromLinks(downloadLinks);
      if (result.success) {
        console.log(`✅ Successfully downloaded ${result.downloaded} files`);
      } else {
        console.warn(`⚠️ Downloaded ${result.downloaded} files, ${result.failed} failed`);
      }
    } catch (error) {
      console.error('Auto-download error:', error);
    }
  };

  const handleManualDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      handleAutoDownload();
    }
  };

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

          {/* Show download progress */}
          {isSuccess && downloading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Downloading {progress.current} of {progress.total} files...
                </p>
              </div>
            </div>
          )}

          {/* Info message about file access */}
          {isSuccess && downloadLinks && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-xs text-green-800 dark:text-green-200">
                ✓ Your files are being downloaded automatically. You can also access them anytime from the Subscription page.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {isSuccess && downloadLinks && (
              <button
                onClick={handleManualDownload}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : (primaryLabel || 'Download Again')}
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


