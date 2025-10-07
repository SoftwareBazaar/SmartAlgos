const fmpService = require('./fmpService');

/**
 * Economic Calendar Service
 * Aggregates upcoming market-moving events from multiple sources
 */
class EconomicCalendarService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour (events don't change that often)
  }

  /**
   * Get today's economic events
   */
  async getTodayEvents() {
    const today = new Date().toISOString().split('T')[0];
    return this.getEventsForDate(today, today);
  }

  /**
   * Get tomorrow's economic events
   */
  async getTomorrowEvents() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return this.getEventsForDate(tomorrowStr, tomorrowStr);
  }

  /**
   * Get this week's economic events
   */
  async getWeekEvents() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const fromDate = today.toISOString().split('T')[0];
    const toDate = nextWeek.toISOString().split('T')[0];
    
    return this.getEventsForDate(fromDate, toDate);
  }

  /**
   * Get events for a specific date range
   */
  async getEventsForDate(fromDate, toDate) {
    const cacheKey = `events_${fromDate}_${toDate}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const events = await fmpService.getEconomicCalendar(fromDate, toDate);
      
      // Sort by impact (HIGH first) and then by date
      const sorted = events.sort((a, b) => {
        const impactOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const impactDiff = (impactOrder[a.impact] || 3) - (impactOrder[b.impact] || 3);
        
        if (impactDiff !== 0) return impactDiff;
        return new Date(a.date) - new Date(b.date);
      });

      this.cache.set(cacheKey, {
        data: sorted,
        timestamp: Date.now()
      });

      return sorted;
    } catch (error) {
      console.error('[EconomicCalendar] Error fetching events:', error.message);
      return [];
    }
  }

  /**
   * Get high-impact events only (the ones that really move markets)
   */
  async getHighImpactEvents(fromDate = null, toDate = null) {
    const allEvents = await this.getEventsForDate(
      fromDate || new Date().toISOString().split('T')[0],
      toDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    return allEvents.filter(event => event.impact === 'HIGH');
  }

  /**
   * Get events by country
   */
  async getEventsByCountry(country, fromDate = null, toDate = null) {
    const allEvents = await this.getEventsForDate(
      fromDate || new Date().toISOString().split('T')[0],
      toDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    return allEvents.filter(event => 
      event.country.toUpperCase() === country.toUpperCase()
    );
  }

  /**
   * Get events by currency (for Forex traders)
   */
  async getEventsByCurrency(currency, fromDate = null, toDate = null) {
    const allEvents = await this.getEventsForDate(
      fromDate || new Date().toISOString().split('T')[0],
      toDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    return allEvents.filter(event => 
      event.currency && event.currency.toUpperCase() === currency.toUpperCase()
    );
  }

  /**
   * Get upcoming earnings for specific stocks
   */
  async getUpcomingEarnings(symbols = [], days = 7) {
    try {
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + days);
      
      const fromDate = today.toISOString().split('T')[0];
      const toDate = future.toISOString().split('T')[0];
      
      const earnings = await fmpService.getEarningsCalendar(fromDate, toDate);
      
      if (symbols.length > 0) {
        return earnings.filter(earning => 
          symbols.includes(earning.symbol)
        );
      }
      
      return earnings;
    } catch (error) {
      console.error('[EconomicCalendar] Error fetching earnings:', error.message);
      return [];
    }
  }

  /**
   * Get market-moving events summary (what traders need to know)
   */
  async getMarketMovingSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const [todayEvents, tomorrowEvents, weekEvents] = await Promise.all([
        this.getEventsForDate(today, today),
        this.getEventsForDate(tomorrowStr, tomorrowStr),
        this.getEventsForDate(today, nextWeekStr)
      ]);

      const highImpactToday = todayEvents.filter(e => e.impact === 'HIGH');
      const highImpactTomorrow = tomorrowEvents.filter(e => e.impact === 'HIGH');
      const highImpactWeek = weekEvents.filter(e => e.impact === 'HIGH');

      return {
        today: {
          all: todayEvents.length,
          highImpact: highImpactToday.length,
          events: highImpactToday.slice(0, 5) // Top 5
        },
        tomorrow: {
          all: tomorrowEvents.length,
          highImpact: highImpactTomorrow.length,
          events: highImpactTomorrow.slice(0, 5)
        },
        thisWeek: {
          all: weekEvents.length,
          highImpact: highImpactWeek.length,
          events: highImpactWeek.slice(0, 10)
        }
      };
    } catch (error) {
      console.error('[EconomicCalendar] Error creating summary:', error.message);
      return {
        today: { all: 0, highImpact: 0, events: [] },
        tomorrow: { all: 0, highImpact: 0, events: [] },
        thisWeek: { all: 0, highImpact: 0, events: [] }
      };
    }
  }

  /**
   * Format event for display
   */
  formatEvent(event) {
    const impactEmoji = {
      HIGH: '🔴',
      MEDIUM: '🟡',
      LOW: '🟢'
    };

    return {
      ...event,
      impactEmoji: impactEmoji[event.impact] || '⚪',
      displayDate: new Date(event.date).toLocaleDateString(),
      displayTime: event.time || 'All Day',
      description: `${event.country} - ${event.event}`
    };
  }
}

module.exports = new EconomicCalendarService();

