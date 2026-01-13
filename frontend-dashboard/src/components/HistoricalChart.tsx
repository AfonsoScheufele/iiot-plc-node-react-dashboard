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
import { format, subHours } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const HistoricalChart = ({ machineId }: { machineId?: string }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const to = new Date().toISOString();
        const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
        const from = subHours(new Date(), hours).toISOString();
        
        const data = await metricsService.getMetrics(machineId, from, to);
        setMetrics(data.reverse());
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [machineId, timeRange]);

  if (loading) {
    return <div className="text-white">Loading historical data...</div>;
  }

  const chartData = {
    labels: metrics.map((m) => format(new Date(m.timestamp), 'HH:mm')),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: metrics.map((m) => parseFloat(m.temperature)),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Pressure (bar)',
        data: metrics.map((m) => parseFloat(m.pressure)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: '#ef4444',
        },
        grid: {
          color: '#374151',
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#ef4444',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: '#3b82f6',
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Pressure (bar)',
          color: '#3b82f6',
        },
      },
    },
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Historical Data</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>
      <div className="bg-gray-700 rounded-lg p-4" style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

