/**
 * Image Display Utilities
 * Provides image proxy and fallback endpoints for the Express app.
 */

// Add image proxy endpoint to handle CORS issues with Supabase Storage
function addImageProxy(app) {
  app.get('/api/images/proxy', async (req, res) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      // Validate it's a Supabase Storage URL
      if (!url.includes('supabase.co/storage')) {
        return res.status(400).json({ error: 'Invalid image URL' });
      }

      const response = await fetch(url);

      if (!response.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000'
      });

      res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error('Image proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });
}

// Add fallback SVG placeholder endpoint
function addFallbackImage(app) {
  app.get('/api/images/fallback/:type', (req, res) => {
    const { type } = req.params;

    const svgPlaceholders = {
      ea: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#1a1a1a"/>
        <text x="150" y="100" text-anchor="middle" fill="#4a9eff" font-family="Arial" font-size="16">EA Image</text>
      </svg>`,
      screenshot: `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#1a1a1a"/>
        <text x="150" y="100" text-anchor="middle" fill="#4a9eff" font-family="Arial" font-size="16">Screenshot</text>
      </svg>`
    };

    const svg = svgPlaceholders[type] || svgPlaceholders.ea;

    res.set({
      'Content-Type': 'image/svg+xml',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(svg);
  });
}

module.exports = { addImageProxy, addFallbackImage };
