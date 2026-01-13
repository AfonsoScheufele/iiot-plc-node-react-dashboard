import { MachinesList } from '../components/MachinesList';
import { RealtimeDashboard } from '../components/RealtimeDashboard';
import { HistoricalChart } from '../components/HistoricalChart';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <MachinesList />
      <RealtimeDashboard />
      <HistoricalChart />
    </div>
  );
};

