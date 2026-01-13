import { useState } from 'react';
import { MachinesList } from '../components/MachinesList';
import { RealtimeDashboard } from '../components/RealtimeDashboard';
import { HistoricalChart } from '../components/HistoricalChart';
import { AlertsList } from '../components/AlertsList';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { machinesService } from '../services/api';
import { Machine } from '../types';
import { useEffect } from 'react';

export const Dashboard = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await machinesService.getAll();
        setMachines(data);
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="space-y-6">
      <PerformanceMetrics />
      <MachinesList />
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="text-white font-semibold">Filter by Machine:</label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Machines</option>
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name} ({machine.id})
              </option>
            ))}
          </select>
          {selectedMachine && (
            <button
              onClick={() => setSelectedMachine('')}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      <AlertsList machineId={selectedMachine || undefined} />
      <RealtimeDashboard machineId={selectedMachine || undefined} />
      <HistoricalChart machineId={selectedMachine || undefined} />
    </div>
  );
};



