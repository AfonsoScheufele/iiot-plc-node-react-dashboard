import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Metrics')
@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Buscar métricas com filtros' })
  @ApiQuery({ name: 'machineId', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO 8601 date string' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO 8601 date string' })
  async findMetrics(
    @Query('machineId') machineId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.metricsService.findMetrics(machineId, from, to);
  }
}



