import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Image, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

const EADownloadSection = ({ ea, subscription, onDownloadSuccess }) => {
  const [downloading, setDownloading] = useState({});
  const [downloadToken, setDownloadToken] = useState(null);

  // Check if user has active subscription for this EA
  const hasActiveSubscription = subscription && 
    subscription.status === 'active' && 
    new Date(subscription.end_date) > new Date();

  const generateDownloadToken = async () => {
    try {
      const response = await apiClient.post('/api/downloads/generate-token', {
        subscriptionId: subscription.id,
        eaId: ea.id
      });
      
      if (response.data.success) {
        setDownloadToken(response.data.data.token);
        return response.data.data.token;
      }
    } catch (error) {
      console.error('Error generating download token:', error);
      toast.error('Failed to generate download token');
    }
    return null;
  };

  const handleDownload = async (fileType) => {
    if (!hasActiveSubscription) {
      toast.error('You need an active subscription to download files');
      return;
    }

    setDownloading(prev => ({ ...prev, [fileType]: true }));

    try {
      // Generate download token if not already available
      let token = downloadToken;
      if (!token) {
        token = await generateDownloadToken();
      }

      if (!token) {
        toast.error('Failed to generate download token');
        return;
      }

      // Create download URL with token
      const downloadUrl = `/api/downloads/ea/${ea.id}?type=${fileType}&token=${token}`;
      
      // Open download in new tab
      window.open(downloadUrl, '_blank');
      
      toast.success(`${fileType.replace('_', ' ')} download started!`);
      
      if (onDownloadSuccess) {
        onDownloadSuccess(fileType);
      }

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'ea_file':
        return <Settings className="h-5 w-5" />;
      case 'set_file':
        return <FileText className="h-5 w-5" />;
      case 'manual':
        return <FileText className="h-5 w-5" />;
      case 'screenshots':
        return <Image className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const getFileLabel = (fileType) => {
    switch (fileType) {
      case 'ea_file':
        return 'EA File (.ex4)';
      case 'set_file':
        return 'Settings File (.set)';
      case 'manual':
        return 'User Manual (PDF)';
      case 'screenshots':
        return 'Screenshots';
      default:
        return fileType;
    }
  };

  const getFileDescription = (fileType) => {
    switch (fileType) {
      case 'ea_file':
        return 'The main Expert Advisor file for MetaTrader';
      case 'set_file':
        return 'Pre-configured settings for optimal performance';
      case 'manual':
        return 'Complete user guide and instructions';
      case 'screenshots':
        return 'Performance charts and trading results';
      default:
        return '';
    }
  };

  const availableFiles = [
    { type: 'ea_file', available: !!ea.ea_file },
    { type: 'set_file', available: !!ea.set_file },
    { type: 'manual', available: !!ea.manual_file },
    { type: 'screenshots', available: ea.screenshots && ea.screenshots.length > 0 }
  ].filter(file => file.available);

  if (!hasActiveSubscription) {
    return (
      <Card>
        <Card.Body className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Subscription Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need an active subscription to download EA files and documentation.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/subscription'}>
              View Subscriptions
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Download Files
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your subscription is active - download all available files
            </p>
          </div>
        </div>

        {availableFiles.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No files available for download at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableFiles.map((file, index) => (
              <motion.div
                key={file.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {getFileLabel(file.type)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {getFileDescription(file.type)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file.type)}
                      disabled={downloading[file.type]}
                      className="w-full"
                    >
                      {downloading[file.type] ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Secure Downloads
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All downloads are secured with authentication tokens. Files are only available to users with active subscriptions.
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EADownloadSection;
