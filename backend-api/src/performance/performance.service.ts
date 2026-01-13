import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from '../metrics/metric.entity';

@Injectable()
export class PerformanceService {
  private startTime: Date = new Date();
  private messageCount: number = 0;
  private messageTimestamps: number[] = [];

  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {}

  async getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.messageTimestamps = this.messageTimestamps.filter((ts) => ts > oneMinuteAgo);
    const messagesPerSecond = this.messageTimestamps.length / 60;

    const recentMetrics = await this.metricRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });

    let totalLatency = 0;
    let latencyCount = 0;

    if (recentMetrics.length > 1) {
      for (let i = 0; i < recentMetrics.length - 1; i++) {
        const timeDiff = new Date(recentMetrics[i].createdAt).getTime() - 
                        new Date(recentMetrics[i + 1].createdAt).getTime();
        if (timeDiff > 0 && timeDiff < 5000) {
          totalLatency += timeDiff;
          latencyCount++;
        }
      }
    }

    const averageLatency = latencyCount > 0 ? totalLatency / latencyCount : 0;

    return {
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime),
      },
      messagesPerSecond: parseFloat(messagesPerSecond.toFixed(2)),
      averageLatency: {
        milliseconds: parseFloat(averageLatency.toFixed(2)),
        formatted: `${parseFloat(averageLatency.toFixed(2))}ms`,
      },
      totalMessages: this.messageCount,
      timestamp: new Date().toISOString(),
    };
  }

  recordMessage() {
    this.messageCount++;
    this.messageTimestamps.push(Date.now());
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

