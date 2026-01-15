import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    if (this.socket && !this.socket.connected) {
      // Socket existe mas não está conectado, tentar reconectar
      this.socket.connect();
      return;
    }

    this.socket = io(`${API_URL}/realtime`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado do WebSocket');
    });

    this.socket.on('connected', (data: { message: string }) => {
      console.log('WebSocket:', data.message);
    });

    // Registrar listeners dinâmicos
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events = [
      'metric:update',
      'machine:status',
      'alert:new',
      'oee:update',
      'downtime:event',
      'production:update',
    ];

    events.forEach((event) => {
      this.socket!.on(event, (data: any) => {
        const listeners = this.listeners.get(event);
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }
      });
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Se socket já está conectado, registrar listener
    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }

    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  subscribeMachine(machineId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:machine', { machineId });
    }
  }

  unsubscribeMachine(machineId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:machine', { machineId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();

