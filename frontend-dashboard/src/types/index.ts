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

export interface Alert {
  id: number;
  machineId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  temperature?: number;
  pressure?: number;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface PerformanceMetrics {
  uptime: {
    seconds: number;
    formatted: string;
  };
  messagesPerSecond: number;
  averageLatency: {
    milliseconds: number;
    formatted: string;
  };
  totalMessages: number;
  timestamp: string;
}
