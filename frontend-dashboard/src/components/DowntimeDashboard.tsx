import { useEffect, useState } from 'react';
import { oeeService } from '../services/api';
import { DowntimeEvent } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

export const DowntimeDashboard = ({ machineId }: { machineId?: string }) => {
  const [events, setEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const fetchDowntimeEvents = async () => {
    try {
      const to = new Date();
      const from = new Date();
      
      switch (timeRange) {
        case '24h':
          from.setHours(from.getHours() - 25);
          break;
        case '7d':
          from.setDate(from.getDate() - 7);
          from.setHours(from.getHours() - 1);
          break;
        case '30d':
          from.setDate(from.getDate() - 30);
          from.setHours(from.getHours() - 1);
          break;
      }

      const data = await oeeService.getDowntimeEvents(
        machineId,
        from.toISOString(),
        to.toISOString()
      );
      setEvents(data);
    } catch (error) {
      console.error('Error fetching downtime events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDowntimeEvents();
  }, [machineId, timeRange]);

  useWebSocket('downtime:event', (event: DowntimeEvent) => {
    if (!machineId || event.machineId === machineId) {
      setEvents((prev) => [event, ...prev]);
    }
  }, [machineId]);

  const handleResolve = async (id: number) => {
    try {
      await oeeService.resolveDowntimeEvent(id);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'RESOLVED', endTime: new Date().toISOString() } : e))
      );
    } catch (error) {
      console.error('Error resolving downtime event:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BREAKDOWN':
        return 'bg-red-500';
      case 'MAINTENANCE':
        return 'bg-yellow-500';
      case 'SETUP':
        return 'bg-blue-500';
      case 'PLANNED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'active') return event.status === 'ACTIVE';
    if (filter === 'resolved') return event.status === 'RESOLVED';
    return true;
  });

  const getTimeRangeDates = () => {
    const to = new Date();
    const from = new Date();
    switch (timeRange) {
      case '24h':
        from.setHours(from.getHours() - 25);
        break;
      case '7d':
        from.setDate(from.getDate() - 7);
        from.setHours(from.getHours() - 1);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        from.setHours(from.getHours() - 1);
        break;
    }
    return { from, to };
  };

  const { from: periodFrom, to: periodTo } = getTimeRangeDates();

  const totalDowntime = filteredEvents
    .filter((e) => {
      if (e.status !== 'RESOLVED') return false;
      if (!e.endTime || !e.startTime) return false;
      
      const startTime = new Date(e.startTime);
      const endTime = new Date(e.endTime);
      
      if (endTime < startTime) return false;
      
      const calculatedDuration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      if (calculatedDuration <= 0 || calculatedDuration > 1440) return false;
      
      if (machineId && e.machineId !== machineId) return false;
      
      return true;
    })
    .reduce((sum, e) => {
      const startTime = new Date(e.startTime);
      const endTime = new Date(e.endTime);
      
      const eventStart = Math.max(startTime.getTime(), periodFrom.getTime());
      const eventEnd = Math.min(endTime.getTime(), periodTo.getTime());
      
      if (eventEnd <= eventStart) return sum;
      
      const durationInPeriod = Math.floor((eventEnd - eventStart) / (1000 * 60));
      
      return sum + Math.max(0, durationInPeriod);
    }, 0);

  const activeDowntime = events.filter((e) => e.status === 'ACTIVE').length;

  if (loading) {
    return <div className="text-white">Loading downtime data...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Downtime Dashboard</h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Downtime</p>
          <p className="text-3xl font-bold text-red-400">
            {Math.floor(totalDowntime / 60)}h {Math.floor(totalDowntime % 60)}m
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Active Events</p>
          <p className="text-3xl font-bold text-yellow-400">{activeDowntime}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Events</p>
          <p className="text-3xl font-bold text-white">{events.length}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(['all', 'active', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No downtime events found</div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-gray-700 rounded-lg p-4 border-l-4 ${
                event.status === 'ACTIVE' ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`${getCategoryColor(event.category)} text-white px-2 py-1 rounded text-xs font-semibold`}
                    >
                      {event.category}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {event.machineId}
                    </span>
                    {event.status === 'ACTIVE' && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {event.reason && (
                    <p className="text-white font-semibold mb-1">{event.reason}</p>
                  )}
                  {event.description && (
                    <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>
                      Start: {new Date(event.startTime).toLocaleString()}
                    </span>
                    {event.endTime && (
                      <span>
                        End: {new Date(event.endTime).toLocaleString()}
                      </span>
                    )}
                    {(() => {
                      let duration = event.duration;
                      if (!duration || duration <= 0) {
                        if (event.endTime && event.startTime) {
                          duration = Math.floor((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60));
                        } else if (event.status === 'ACTIVE') {
                          duration = Math.floor((new Date().getTime() - new Date(event.startTime).getTime()) / (1000 * 60));
                        }
                      }
                      if (duration && duration > 0) {
                        const hours = Math.floor(duration / 60);
                        const minutes = duration % 60;
                        return <span>Duration: {hours}h {minutes}m</span>;
                      }
                      return null;
                    })()}
                  </div>
                </div>
                {event.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleResolve(event.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

