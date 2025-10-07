const express = require('express');
const router = express.Router();
const economicCalendarService = require('../services/economicCalendarService');
const fmpService = require('../services/fmpService');

// @route   GET /api/economic-calendar/today
// @desc    Get today's economic events
// @access  Public
router.get('/today', async (req, res) => {
  try {
    const events = await economicCalendarService.getTodayEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get today events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/tomorrow
// @desc    Get tomorrow's economic events
// @access  Public
router.get('/tomorrow', async (req, res) => {
  try {
    const events = await economicCalendarService.getTomorrowEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get tomorrow events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tomorrow\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/week
// @desc    Get this week's economic events
// @access  Public
router.get('/week', async (req, res) => {
  try {
    const events = await economicCalendarService.getWeekEvents();
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get week events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week\'s events'
    });
  }
});

// @route   GET /api/economic-calendar/high-impact
// @desc    Get high-impact events only
// @access  Public
router.get('/high-impact', async (req, res) => {
  try {
    const { from, to } = req.query;
    const events = await economicCalendarService.getHighImpactEvents(from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get high-impact events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch high-impact events'
    });
  }
});

// @route   GET /api/economic-calendar/country/:country
// @desc    Get events by country
// @access  Public
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { from, to } = req.query;
    const events = await economicCalendarService.getEventsByCountry(country, from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get country events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch country events'
    });
  }
});

// @route   GET /api/economic-calendar/currency/:currency
// @desc    Get events by currency (for Forex traders)
// @access  Public
router.get('/currency/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const { from, to } = req.query;
    const events = await economicCalendarService.getEventsByCurrency(currency, from, to);
    
    res.json({
      success: true,
      data: events.map(e => economicCalendarService.formatEvent(e))
    });
  } catch (error) {
    console.error('Get currency events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency events'
    });
  }
});

// @route   GET /api/economic-calendar/earnings
// @desc    Get upcoming earnings
// @access  Public
router.get('/earnings', async (req, res) => {
  try {
    const { symbols, days = 7 } = req.query;
    const symbolArray = symbols ? symbols.split(',') : [];
    const earnings = await economicCalendarService.getUpcomingEarnings(symbolArray, parseInt(days));
    
    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings calendar'
    });
  }
});

// @route   GET /api/economic-calendar/summary
// @desc    Get market-moving events summary
// @access  Public
router.get('/summary', async (req, res) => {
  try {
    const summary = await economicCalendarService.getMarketMovingSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events summary'
    });
  }
});

// @route   GET /api/economic-calendar/news
// @desc    Get market news
// @access  Public
router.get('/news', async (req, res) => {
  try {
    const { symbols, limit = 20 } = req.query;
    const tickerArray = symbols ? symbols.split(',') : [];
    const news = await fmpService.getMarketNews({
      tickers: tickerArray,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market news'
    });
  }
});

module.exports = router;

