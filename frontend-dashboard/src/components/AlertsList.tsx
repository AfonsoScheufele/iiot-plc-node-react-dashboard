import { useEffect, useState } from 'react';
import { alertsService } from '../services/api';
import { Alert } from '../types';

export const AlertsList = ({ machineId }: { machineId?: string }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertsService.getAll(machineId, showResolved ? undefined : false);
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, [showResolved, machineId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 border-red-500';
      case 'HIGH':
        return 'bg-red-500 border-red-400';
      case 'MEDIUM':
        return 'bg-yellow-500 border-yellow-400';
      case 'LOW':
        return 'bg-blue-500 border-blue-400';
      default:
        return 'bg-gray-500 border-gray-400';
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await alertsService.resolve(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading alerts...</div>;
  }

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Alerts</h2>
        <label className="flex items-center text-white">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="mr-2"
          />
          Show resolved
        </label>
      </div>

      {activeAlerts.length === 0 && !showResolved && (
        <div className="text-green-400 text-center py-4">✅ No active alerts</div>
      )}

      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`${getSeverityColor(alert.severity)} border-l-4 rounded-lg p-4`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white">{alert.severity}</span>
                  <span className="text-sm text-gray-200">{alert.type}</span>
                </div>
                <p className="text-white mb-1">{alert.message}</p>
                <p className="text-sm text-gray-200">
                  Machine: {alert.machineId} | {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleResolve(alert.id)}
                className="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200 transition text-sm"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}

        {showResolved && resolvedAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-700 border-l-4 border-gray-500 rounded-lg p-4 opacity-60"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 line-through">{alert.severity}</span>
              <span className="text-sm text-gray-400">{alert.type}</span>
              <span className="text-xs text-green-400">RESOLVED</span>
            </div>
            <p className="text-gray-300 mb-1">{alert.message}</p>
            <p className="text-sm text-gray-400">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

