export interface Machine {
  id: string;
  name: string;
  description: string | null;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  id: number;
  machineId: string;
  temperature: string;
  pressure: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  timestamp: string;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
}

