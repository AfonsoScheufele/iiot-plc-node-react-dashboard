import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`✅ Cliente conectado: ${client.id} (Total: ${this.connectedClients.size})`);
    
    client.emit('connected', { message: 'Conectado ao servidor WebSocket' });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`❌ Cliente desconectado: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @SubscribeMessage('subscribe:machine')
  handleSubscribeMachine(@MessageBody() data: { machineId: string }, @ConnectedSocket() client: Socket) {
    const { machineId } = data;
    client.join(`machine:${machineId}`);
    this.logger.log(`📡 Cliente ${client.id} inscrito na máquina ${machineId}`);
    client.emit('subscribed', { machineId });
  }

  @SubscribeMessage('unsubscribe:machine')
  handleUnsubscribeMachine(@MessageBody() data: { machineId: string }, @ConnectedSocket() client: Socket) {
    const { machineId } = data;
    client.leave(`machine:${machineId}`);
    this.logger.log(`📡 Cliente ${client.id} desinscrito da máquina ${machineId}`);
  }

  emitMetricUpdate(machineId: string, metric: any) {
    this.server.to(`machine:${machineId}`).emit('metric:update', metric);
    this.server.emit('metric:update', metric);
  }

  emitMachineStatusUpdate(machineId: string, status: any) {
    this.server.to(`machine:${machineId}`).emit('machine:status', status);
    this.server.emit('machine:status', status);
  }

  emitAlert(alert: any) {
    this.server.emit('alert:new', alert);
  }

  emitOEEUpdate(machineId: string, oee: any) {
    this.server.to(`machine:${machineId}`).emit('oee:update', oee);
    this.server.emit('oee:update', oee);
  }

  emitDowntimeEvent(event: any) {
    this.server.emit('downtime:event', event);
  }

  emitProductionUpdate(machineId: string, production: any) {
    this.server.to(`machine:${machineId}`).emit('production:update', production);
    this.server.emit('production:update', production);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

