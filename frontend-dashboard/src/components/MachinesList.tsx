import { useEffect, useState } from 'react';
import { machinesService } from '../services/api';
import { Machine } from '../types/index';
import { useWebSocket } from '../hooks/useWebSocket';

export const MachinesList = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await machinesService.getAll();
        setMachines(data);
      } catch (error) {
        console.error('Error fetching machines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  // Escutar atualizações via WebSocket
  useWebSocket('machine:status', (data: Machine) => {
    setMachines((prev) => {
      const index = prev.findIndex((m) => m.id === data.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return updated;
      }
      return prev;
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-500';
      case 'STOPPED':
        return 'bg-yellow-500';
      case 'ERROR':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-white">Loading machines...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Machines</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-white">{machine.name}</h3>
              <span
                className={`${getStatusColor(machine.status)} w-3 h-3 rounded-full`}
                title={machine.status}
              />
            </div>
            <p className="text-gray-400 text-sm">ID: {machine.id}</p>
            <p className="text-gray-400 text-sm">
              Status: <span className="text-white">{machine.status}</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Updated: {new Date(machine.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

