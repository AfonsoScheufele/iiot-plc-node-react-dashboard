import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { oeeService } from '../services/api';
import { OEE } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const OEEDashboard = ({ machineId }: { machineId?: string }) => {
  const [oee, setOee] = useState<OEE | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const fetchOEE = async () => {
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

      if (machineId) {
        const data = await oeeService.calculate(
          machineId,
          from.toISOString(),
          to.toISOString()
        );
        setOee(data);
      }
    } catch (error) {
      console.error('Error fetching OEE:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (machineId) {
      fetchOEE();
    } else {
      setLoading(false);
      setOee(null);
    }
  }, [machineId, timeRange]);

  useWebSocket('oee:update', (data: OEE) => {
    if (!machineId || data) {
      setOee(data);
    }
  }, [machineId]);

  if (loading) {
    return <div className="text-white">Loading OEE data...</div>;
  }

  const handleGenerateSampleData = async () => {
    if (!machineId) return;
    try {
      setLoading(true);
      await oeeService.generateSampleData(machineId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(true);
      await fetchOEE();
    } catch (error: any) {
      console.error('Error generating sample data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate sample data';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!oee) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">OEE Dashboard</h2>
        <div className="text-gray-400 text-center py-8">
          {machineId ? (
            <div>
              <p className="mb-4">No OEE data available for this machine</p>
              <button
                onClick={handleGenerateSampleData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Generate Sample Data
              </button>
            </div>
          ) : (
            'Select a machine to view OEE'
          )}
        </div>
      </div>
    );
  }

  const oeeData = {
    labels: ['Availability', 'Performance', 'Quality'],
    datasets: [
      {
        data: [oee.availability, oee.performance, oee.quality],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const productionData = {
    labels: ['Planned', 'Actual', 'Good Parts'],
    datasets: [
      {
        label: 'Production',
        data: [oee.plannedTime, oee.actualProduction, oee.goodParts],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const getOeeColor = (value: number) => {
    if (value >= 85) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">OEE Dashboard</h2>
        <div className="flex gap-2 items-center">
          {machineId && (
            <button
              onClick={handleGenerateSampleData}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm transition"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Sample Data'}
            </button>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Overall OEE</p>
          <p className={`text-5xl font-bold ${getOeeColor(oee.oee)}`}>
            {oee.oee.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Availability</p>
          <p className="text-4xl font-bold text-green-400">
            {oee.availability.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Performance</p>
          <p className="text-4xl font-bold text-blue-400">
            {oee.performance.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">OEE Components</h3>
          <div style={{ height: '250px' }}>
            <Doughnut
              data={oeeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#fff',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Production Metrics</h3>
          <div style={{ height: '250px' }}>
            <Bar
              data={productionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#374151' },
                  },
                  y: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#374151' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Quality</p>
          <p className="text-2xl font-bold text-yellow-400">
            {oee.quality.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Operating Time</p>
          <p className="text-2xl font-bold text-white">
            {Math.floor(oee.operatingTime / 60)}h {oee.operatingTime % 60}m
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Actual Production</p>
          <p className="text-2xl font-bold text-blue-400">
            {oee.actualProduction}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Good Parts</p>
          <p className="text-2xl font-bold text-green-400">
            {oee.goodParts}
          </p>
        </div>
      </div>
    </div>
  );
};

