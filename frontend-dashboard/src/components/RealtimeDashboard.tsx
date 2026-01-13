import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { metricsService } from '../services/api';
import { Metric } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const RealtimeDashboard = ({ machineId }: { machineId?: string }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsService.getMetrics(machineId);
        setMetrics(data.slice(0, 50).reverse());
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, [machineId]);

  if (loading) {
    return <div className="text-white">Loading metrics...</div>;
  }

  const temperatureData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: metrics.map((m) => parseFloat(m.temperature)),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const pressureData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Pressure (bar)',
        data: metrics.map((m) => parseFloat(m.pressure)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
    },
  };

  const latestMetric = metrics[0];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Real-time Dashboard</h2>
      
      {latestMetric && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Temperature</p>
            <p className="text-3xl font-bold text-red-400">
              {parseFloat(latestMetric.temperature).toFixed(1)}°C
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Pressure</p>
            <p className="text-3xl font-bold text-blue-400">
              {parseFloat(latestMetric.pressure).toFixed(1)} bar
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-2xl font-bold text-white">{latestMetric.status}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4" style={{ height: '300px' }}>
          <Line data={temperatureData} options={chartOptions} />
        </div>
        <div className="bg-gray-700 rounded-lg p-4" style={{ height: '300px' }}>
          <Line data={pressureData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

