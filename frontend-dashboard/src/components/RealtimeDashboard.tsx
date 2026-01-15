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
import { useWebSocket, useMachineSubscription } from '../hooks/useWebSocket';

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

  useMachineSubscription(machineId);

  useEffect(() => {
    const fetchInitialMetrics = async () => {
      try {
        const data = await metricsService.getMetrics(machineId);
        const sorted = data.slice(-50).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMetrics(sorted);
      } catch (error) {
        console.error('Error fetching initial metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMetrics();
  }, [machineId]);

  useWebSocket('metric:update', (data: Metric) => {
    if (!machineId || data.machineId === machineId) {
      setMetrics((prev) => {
        const exists = prev.some(m => 
          m.timestamp === data.timestamp && m.machineId === data.machineId
        );
        if (exists) {
          return prev;
        }
        
        const updated = [...prev, data].slice(-50);
        const sorted = updated.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        return sorted;
      });
    }
  }, [machineId]);

  const temperatureData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: metrics.map((m) => parseFloat(m.temperature)),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
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
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Sem animação para atualizações instantâneas
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
          maxRotation: 0,
          autoSkip: true,
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

  const latestMetric = metrics[metrics.length - 1];

  if (loading) {
    return <div className="text-white">Loading metrics...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Real-time Dashboard</h2>
        {machineId && (
          <span className="text-sm text-gray-400">Machine: {machineId}</span>
        )}
      </div>
      
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
          <Line 
            key={`temperature-${metrics.length}`}
            data={temperatureData} 
            options={chartOptions}
            redraw
          />
        </div>
        <div className="bg-gray-700 rounded-lg p-4" style={{ height: '300px' }}>
          <Line 
            key={`pressure-${metrics.length}`}
            data={pressureData} 
            options={chartOptions}
            redraw
          />
        </div>
      </div>
    </div>
  );
};

