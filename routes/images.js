/**
 * Image Proxy Routes
 * Handles image proxying for CORS issues and fallback images
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @route   GET /api/images/proxy
 * @desc    Proxy images from Supabase Storage to avoid CORS issues
 * @access  Public
 */
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL parameter required' 
      });
    }

    // Validate that it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid image URL - must be Supabase Storage URL' 
      });
    }

    console.log(`[Image Proxy] Fetching image from: ${url}`);

    // Fetch the image from Supabase Storage
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (!response.data) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    const contentType = response.headers['content-type'] || 'image/jpeg';

    // Set CORS and cache headers
    // Use specific origin if credentials are needed, otherwise allow all
    const origin = req.headers.origin;
    const corsHeaders = {
      'Content-Type': contentType,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'Content-Length': response.data.length
    };
    
    // Set origin header - use specific origin if available and valid
    if (origin && (origin.startsWith('http://localhost') || origin.includes('railway.app') || origin.includes('vercel.app'))) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }
    
    res.set(corsHeaders);

    console.log(`[Image Proxy] ✅ Serving image (${response.data.length} bytes, ${contentType})`);

    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('[Image Proxy] ❌ Error fetching image:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        success: false,
        error: `Image fetch failed: ${error.response.status} ${error.response.statusText}`
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch image' 
    });
  }
});

/**
 * @route   GET /api/images/fallback/:type
 * @desc    Serve fallback placeholder images
 * @access  Public
 */
router.get('/fallback/:type', (req, res) => {
  const { type } = req.params;
  
  // Create a simple SVG placeholder
  const svgPlaceholder = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
      ${type === 'ea' ? 'EA' : type === 'utility' ? 'Utility' : 'Image'} Placeholder
    </text>
  </svg>`;

  res.set({
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=3600'
  });

  res.send(svgPlaceholder);
});

module.exports = router;

