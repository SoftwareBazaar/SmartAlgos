import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';

const sentimentColors = {
  bullish: 'text-green-600 dark:text-green-300',
  bearish: 'text-red-600 dark:text-red-300',
  neutral: 'text-gray-600 dark:text-gray-300'
};

const PNLCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/api/analysis/economic-calendar');
        
        // Validate response data
        if (response.data && response.data.success) {
          const data = response.data.data;
          // Ensure data is an array and filter out invalid entries
          const validEvents = Array.isArray(data) 
            ? data.filter(event => event && typeof event === 'object' && event.title)
            : [];
          setEvents(validEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching P&L calendar:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load P&L calendar';
        setError(String(errorMessage));
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="py-12 flex flex-col items-center text-gray-500 dark:text-gray-300">
            <LoadingSpinner />
            <span className="mt-3">Loading P&L calendar events...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <div className="py-12 text-center text-red-600 dark:text-red-300">
            <AlertTriangle className="mx-auto h-8 w-8 mb-3" />
            {error}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">P&L Calendar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming events that can impact strategy profitability.</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {events.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No upcoming events detected.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event, index) => {
              // Ensure event is valid and has required properties
              if (!event || typeof event !== 'object' || !event.title) {
                return null;
              }
              
              const eventDate = event.date ? new Date(event.date) : null;
              const dateString = eventDate && !isNaN(eventDate.getTime()) 
                ? eventDate.toLocaleString() 
                : 'Date TBD';
              
              return (
                <li key={event.id || `event-${index}`} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{dateString}</span>
                      {event.impact && typeof event.impact === 'string' && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Impact: {event.impact}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">{String(event.title || 'Untitled Event')}</p>
                    {event.description && typeof event.description === 'string' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{event.description}</p>
                    )}
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center space-x-4">
                    {event.sentiment && typeof event.sentiment === 'string' && (
                      <div className={`flex items-center space-x-1 text-sm font-medium ${sentimentColors[event.sentiment] || sentimentColors.neutral}`}>
                        <TrendingUp className="h-4 w-4" />
                        <span className="capitalize">{event.sentiment}</span>
                      </div>
                    )}
                    {event.expectedPnlImpact && typeof event.expectedPnlImpact === 'string' && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Expected P&L impact</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{event.expectedPnlImpact}</p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};

export default PNLCalendar;
