import { useState } from 'react';
import { MachinesList } from '../components/MachinesList';
import { RealtimeDashboard } from '../components/RealtimeDashboard';
import { HistoricalChart } from '../components/HistoricalChart';
import { AlertsList } from '../components/AlertsList';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { OEEDashboard } from '../components/OEEDashboard';
import { DowntimeDashboard } from '../components/DowntimeDashboard';
import { ProductionDashboard } from '../components/ProductionDashboard';
import { machinesService } from '../services/api';
import { Machine } from '../types';
import { useEffect } from 'react';

export const Dashboard = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'oee' | 'downtime' | 'production'>('overview');

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
        <div className="flex items-center gap-4 mb-4">
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('oee')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'oee'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            OEE
          </button>
          <button
            onClick={() => setActiveTab('downtime')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'downtime'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Downtime
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'production'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Production
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <AlertsList machineId={selectedMachine || undefined} />
          <RealtimeDashboard machineId={selectedMachine || undefined} />
          <HistoricalChart machineId={selectedMachine || undefined} />
        </>
      )}

      {activeTab === 'oee' && (
        <OEEDashboard machineId={selectedMachine || undefined} />
      )}

      {activeTab === 'downtime' && (
        <DowntimeDashboard machineId={selectedMachine || undefined} />
      )}

      {activeTab === 'production' && (
        <ProductionDashboard machineId={selectedMachine || undefined} />
      )}
    </div>
  );
};



