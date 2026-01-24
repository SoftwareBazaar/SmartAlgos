import { useState, useCallback } from 'react';

/**
 * Custom hook for handling automatic file downloads
 * @returns {Object} Hook methods and state
 */
const useAutoDownload = () => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [errors, setErrors] = useState([]);

    /**
     * Download a single file
     * @param {string} url - Download URL
     * @param {string} filename - Suggested filename
     */
    const downloadFile = useCallback(async (url, filename) => {
        try {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
        } catch (error) {
            console.error('Download error:', error);
            return false;
        }
    }, []);

    /**
     * Download multiple files sequentially
     * @param {Array<{url: string, filename: string, type: string}>} files - Array of file objects
     * @param {number} delay - Delay between downloads in milliseconds (default: 1000)
     */
    const downloadMultiple = useCallback(async (files, delay = 1000) => {
        if (!files || files.length === 0) {
            console.warn('No files to download');
            return { success: false, downloaded: 0, failed: 0 };
        }

        setDownloading(true);
        setProgress({ current: 0, total: files.length });
        setErrors([]);

        const results = {
            success: true,
            downloaded: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Skip null/undefined files
            if (!file || !file.url) {
                console.warn(`Skipping file at index ${i}: missing URL`);
                continue;
            }

            setProgress({ current: i + 1, total: files.length });

            try {
                const success = await downloadFile(file.url, file.filename);

                if (success) {
                    results.downloaded++;
                    console.log(`✅ Downloaded: ${file.filename || file.type}`);
                } else {
                    results.failed++;
                    const error = `Failed to download ${file.filename || file.type}`;
                    results.errors.push(error);
                    setErrors(prev => [...prev, error]);
                }
            } catch (error) {
                results.failed++;
                const errorMsg = `Error downloading ${file.filename || file.type}: ${error.message}`;
                results.errors.push(errorMsg);
                setErrors(prev => [...prev, errorMsg]);
                console.error(errorMsg);
            }

            // Add delay between downloads to avoid browser blocking
            if (i < files.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        setDownloading(false);
        setProgress({ current: files.length, total: files.length });

        if (results.failed > 0) {
            results.success = false;
        }

        return results;
    }, [downloadFile]);

    /**
     * Download ZIP package (priority method)
     * @param {string} zipUrl - ZIP file download URL
     * @param {string} eaName - EA name for filename
     * @returns {Promise<Object>} Download result
     */
    const downloadZipPackage = useCallback(async (zipUrl, eaName) => {
        if (!zipUrl) {
            console.warn('No ZIP URL provided');
            return { success: false, error: 'No ZIP URL provided' };
        }

        setDownloading(true);
        setProgress({ current: 0, total: 1 });
        setErrors([]);

        try {
            const filename = `${eaName.replace(/[^a-z0-9]/gi, '_')}_Package.zip`;
            
            console.log('🚀 Starting ZIP download:', filename);
            
            const success = await downloadFile(zipUrl, filename);
            
            if (success) {
                setProgress({ current: 1, total: 1 });
                console.log('✅ ZIP download completed');
                return { success: true, filename };
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('❌ ZIP download failed:', error);
            const errorMsg = `Failed to download ZIP: ${error.message}`;
            setErrors([errorMsg]);
            return { success: false, error: errorMsg };
        } finally {
            setDownloading(false);
        }
    }, [downloadFile]);

    /**
     * Download files from download links object
     * Priority: ZIP package first, then individual files as fallback
     * @param {Object} downloadLinks - Object with file types as keys and URLs as values
     * @param {string} eaName - EA name for ZIP filename
     * @returns {Promise<Object>} Download results
     */
    const downloadFromLinks = useCallback(async (downloadLinks, eaName = 'EA') => {
        if (!downloadLinks || typeof downloadLinks !== 'object') {
            console.warn('Invalid download links provided');
            return { success: false, downloaded: 0, failed: 0 };
        }

        // Priority 1: Try ZIP package first
        if (downloadLinks.zip_package) {
            console.log('📦 ZIP package available, downloading...');
            const result = await downloadZipPackage(downloadLinks.zip_package, eaName);
            
            if (result.success) {
                return {
                    success: true,
                    downloaded: 1,
                    failed: 0,
                    method: 'zip',
                    filename: result.filename
                };
            } else {
                console.warn('⚠️ ZIP download failed, falling back to individual files');
            }
        }

        // Priority 2: Fallback to individual files
        const files = [];
        const fileTypeNames = {
            ea_file: 'EA File.ex4',
            set_file: 'Settings.set',
            manual: 'Manual.pdf',
            screenshots: 'Screenshots.zip'
        };

        // Convert download links object to array of file objects (skip zip_package)
        Object.entries(downloadLinks).forEach(([type, url]) => {
            if (url && type !== 'zip_package') {
                files.push({
                    url,
                    filename: fileTypeNames[type] || `${type}.file`,
                    type
                });
            }
        });

        if (files.length === 0) {
            console.warn('No downloadable files found in links');
            return { success: false, downloaded: 0, failed: 0 };
        }

        const result = await downloadMultiple(files);
        return { ...result, method: 'individual' };
    }, [downloadMultiple, downloadZipPackage]);

    /**
     * Reset hook state
     */
    const reset = useCallback(() => {
        setDownloading(false);
        setProgress({ current: 0, total: 0 });
        setErrors([]);
    }, []);

    return {
        downloading,
        progress,
        errors,
        downloadFile,
        downloadMultiple,
        downloadZipPackage,
        downloadFromLinks,
        reset
    };
};

export default useAutoDownload;
