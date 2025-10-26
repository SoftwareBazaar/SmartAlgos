/**
 * Fix Image Display Issues
 * This script fixes the image display problems by:
 * 1. Ensuring proper CORS headers for Supabase Storage
 * 2. Adding fallback images for broken URLs
 * 3. Updating the frontend to handle image loading errors
 */

const express = require('express');
const path = require('path');

// Add image proxy endpoint to handle CORS issues
function addImageProxy(app) {
  // Proxy endpoint for Supabase Storage images
  app.get('/api/images/proxy', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      // Validate that it's a Supabase Storage URL
      if (!url.includes('supabase.co/storage')) {
        return res.status(400).json({ error: 'Invalid image URL' });
      }

      // Fetch the image from Supabase Storage
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const imageBuffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Set CORS headers
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000' // 1 year cache
      });

      res.send(imageBuffer);
    } catch (error) {
      console.error('Image proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });
}

// Add fallback image endpoint
function addFallbackImage(app) {
  app.get('/api/images/fallback/:type', (req, res) => {
    const { type } = req.params;
    
    // Return a simple SVG placeholder based on type
    const svgPlaceholders = {
      'ea': `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#1a1a1a"/>
        <text x="150" y="100" text-anchor="middle" fill="#4a9eff" font-family="Arial" font-size="16">EA Image</text>
      </svg>`,
      'screenshot': `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#1a1a1a"/>
        <text x="150" y="100" text-anchor="middle" fill="#4a9eff" font-family="Arial" font-size="16">Screenshot</text>
      </svg>`
    };

    const svg = svgPlaceholders[type] || svgPlaceholders['ea'];

    res.set({
      'Content-Type': 'image/svg+xml',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(svg);
  });
}

module.exports = { addImageProxy, addFallbackImage };
