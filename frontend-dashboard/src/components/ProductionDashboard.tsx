import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { oeeService } from '../services/api';
import { ProductionRun } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ProductionDashboard = ({ machineId }: { machineId?: string }) => {
  const [runs, setRuns] = useState<ProductionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const fetchProductionRuns = async () => {
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

      const data = await oeeService.getProductionRuns(
        machineId,
        from.toISOString(),
        to.toISOString()
      );
      setRuns(data);
    } catch (error) {
      console.error('Error fetching production runs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionRuns();
  }, [machineId, timeRange]);

  useWebSocket('production:update', (data: ProductionRun) => {
    if (!machineId || data.machineId === machineId) {
      setRuns((prev) => {
        const index = prev.findIndex((r) => r.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [data, ...prev];
      });
    }
  }, [machineId]);

  if (loading) {
    return <div className="text-white">Loading production data...</div>;
  }

  const totalPlanned = runs.reduce((sum, r) => sum + r.plannedProduction, 0);
  const totalActual = runs.reduce((sum, r) => sum + r.actualProduction, 0);
  const totalGood = runs.reduce((sum, r) => sum + r.goodParts, 0);
  const efficiency = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const productionData = {
    labels: runs.slice(0, 10).map((r) => new Date(r.startTime).toLocaleDateString()),
    datasets: [
      {
        label: 'Planned',
        data: runs.slice(0, 10).map((r) => r.plannedProduction),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Actual',
        data: runs.slice(0, 10).map((r) => r.actualProduction),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
      },
    ],
  };

  const qualityData = {
    labels: runs.slice(0, 10).map((r) => new Date(r.startTime).toLocaleDateString()),
    datasets: [
      {
        label: 'Good Parts',
        data: runs.slice(0, 10).map((r) => r.goodParts),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Defective Parts',
        data: runs.slice(0, 10).map((r) => r.defectiveParts),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
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

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Production Dashboard</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Planned Production</p>
          <p className="text-3xl font-bold text-blue-400">{totalPlanned}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Actual Production</p>
          <p className="text-3xl font-bold text-green-400">{totalActual}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Good Parts</p>
          <p className="text-3xl font-bold text-green-500">{totalGood}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Efficiency</p>
          <p className="text-3xl font-bold text-yellow-400">
            {efficiency.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Production vs Planned</h3>
          <div style={{ height: '300px' }}>
            <Bar data={productionData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Quality Metrics</h3>
          <div style={{ height: '300px' }}>
            <Bar data={qualityData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Recent Production Runs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-600">
                <th className="pb-2">Machine</th>
                <th className="pb-2">Start Time</th>
                <th className="pb-2">Planned</th>
                <th className="pb-2">Actual</th>
                <th className="pb-2">Good</th>
                <th className="pb-2">Defective</th>
                <th className="pb-2">OEE</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No production runs found. Generate sample data in the OEE tab.
                  </td>
                </tr>
              ) : (
                runs.slice(0, 10).map((run) => (
                <tr key={run.id} className="text-gray-300 text-sm border-b border-gray-600">
                  <td className="py-2">{run.machineId}</td>
                  <td className="py-2">
                    {new Date(run.startTime).toLocaleString()}
                  </td>
                  <td className="py-2">{run.plannedProduction}</td>
                  <td className="py-2">{run.actualProduction}</td>
                  <td className="py-2 text-green-400">{run.goodParts}</td>
                  <td className="py-2 text-red-400">{run.defectiveParts}</td>
                  <td className="py-2">
                    {run.oee ? `${Number(run.oee).toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        run.status === 'RUNNING'
                          ? 'bg-green-500'
                          : run.status === 'COMPLETED'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

