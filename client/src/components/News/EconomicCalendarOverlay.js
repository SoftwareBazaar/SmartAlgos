/**
 * Economic Calendar Overlay Component
 * Shows high-impact economic events that may affect markets
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../UI/Card';
import apiClient from '../../lib/apiClient';

const EconomicCalendarOverlay = ({ date, onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEconomicEvents();
  }, [date]);

  const fetchEconomicEvents = async () => {
    try {
      setLoading(true);
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/api/economic-calendar', {
        params: { date: targetDate, impact: 'high' }
      });
      
      const eventsData = response.data?.data || [];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      // Fallback to sample events
      setEvents([
        {
          id: 'ec-1',
          country: 'US',
          event: 'Non-Farm Payrolls',
          impact: 'HIGH',
          time: '14:30',
          actual: null,
          forecast: '200K',
          previous: '180K'
        },
        {
          id: 'ec-2',
          country: 'EUR',
          event: 'ECB Interest Rate Decision',
          impact: 'HIGH',
          time: '14:45',
          actual: null,
          forecast: '4.50%',
          previous: '4.50%'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'All Day';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  if (loading && events.length === 0) {
    return (
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              High-Impact Events Today
            </h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading events...</div>
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              High-Impact Events {date ? `on ${new Date(date).toLocaleDateString()}` : 'Today'}
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {events.filter(e => e.impact === 'HIGH').length} high impact
          </span>
        </div>

        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border-2 ${getImpactColor(event.impact)} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => onEventClick && onEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">{event.country}</span>
                    {event.impact === 'HIGH' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm font-semibold mb-1">{event.event}</p>
                  <div className="flex items-center gap-3 text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(event.time)}</span>
                    </div>
                    {event.forecast && (
                      <span>Forecast: {event.forecast}</span>
                    )}
                    {event.previous && (
                      <span>Previous: {event.previous}</span>
                    )}
                  </div>
                </div>
                {event.actual !== null && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {events.length > 5 && (
          <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center">
            View all {events.length} events
          </button>
        )}
      </div>
    </Card>
  );
};

export default EconomicCalendarOverlay;

