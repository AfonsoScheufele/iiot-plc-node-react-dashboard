import { useEffect, useState } from 'react';
import { performanceService } from '../services/api';
import { PerformanceMetrics as PerformanceMetricsType } from '../types';

export const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await performanceService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Performance metrics ainda usa polling (não há evento WebSocket específico)
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-white">Loading performance metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-white">No metrics available</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">System Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Uptime</p>
          <p className="text-2xl font-bold text-green-400">{metrics.uptime.formatted}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Messages/sec</p>
          <p className="text-2xl font-bold text-blue-400">{metrics.messagesPerSecond}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Avg Latency</p>
          <p className="text-2xl font-bold text-yellow-400">{metrics.averageLatency.formatted}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Messages</p>
          <p className="text-2xl font-bold text-white">{metrics.totalMessages.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-gray-400 text-xs mt-4 text-right">
        Last update: {new Date(metrics.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
};



