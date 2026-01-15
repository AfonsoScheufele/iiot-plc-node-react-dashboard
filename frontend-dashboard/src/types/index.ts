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

export interface OEE {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  plannedTime: number;
  operatingTime: number;
  actualProduction: number;
  goodParts: number;
  totalParts: number;
}

export interface ProductionRun {
  id: number;
  machineId: string;
  startTime: string;
  endTime?: string;
  plannedProduction: number;
  actualProduction: number;
  goodParts: number;
  defectiveParts: number;
  plannedTime: number;
  operatingTime: number;
  downtime: number;
  availability?: number;
  performance?: number;
  quality?: number;
  oee?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DowntimeEvent {
  id: number;
  machineId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  category: string;
  reason?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityDefect {
  id: number;
  machineId: string;
  timestamp: string;
  defectType: string;
  description?: string;
  quantity: number;
  createdAt: string;
}
