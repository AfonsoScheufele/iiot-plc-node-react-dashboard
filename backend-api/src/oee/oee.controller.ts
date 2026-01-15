import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OeeService } from './oee.service';
import { ProductionRun } from './production-run.entity';
import { DowntimeEvent } from './downtime-event.entity';
import { QualityDefect } from './quality-defect.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('OEE')
@Controller('oee')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OeeController {
  constructor(private readonly oeeService: OeeService) {}

  @Get('calculate')
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Calcular OEE para um período' })
  async calculateOEE(
    @Query('machineId') machineId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Últimas 24h
    const toDate = to ? new Date(to) : new Date();
    return this.oeeService.calculateOEE(machineId, fromDate, toDate);
  }

  @Get('production-runs')
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Listar production runs' })
  async findProductionRuns(
    @Query('machineId') machineId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.oeeService.findProductionRuns(machineId, fromDate, toDate);
  }

  @Post('production-runs')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Criar ou atualizar production run' })
  async createProductionRun(@Body() data: Partial<ProductionRun>) {
    return this.oeeService.createOrUpdateProductionRun(data);
  }

  @Get('downtime-events')
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Listar eventos de downtime' })
  async findDowntimeEvents(
    @Query('machineId') machineId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.oeeService.findDowntimeEvents(machineId, fromDate, toDate);
  }

  @Post('downtime-events')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Criar evento de downtime' })
  async createDowntimeEvent(@Body() data: Partial<DowntimeEvent>) {
    return this.oeeService.createDowntimeEvent(data);
  }

  @Put('downtime-events/:id/resolve')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Resolver evento de downtime' })
  async resolveDowntimeEvent(@Param('id', ParseIntPipe) id: number) {
    return this.oeeService.resolveDowntimeEvent(id);
  }

  @Post('quality-defects')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Registrar defeito de qualidade' })
  async recordQualityDefect(@Body() data: Partial<QualityDefect>) {
    return this.oeeService.recordQualityDefect(data);
  }

  @Post('generate-sample-data')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Gerar dados de exemplo para demonstração OEE (limpa dados existentes primeiro)' })
  async generateSampleData(@Query('machineId') machineId: string) {
    if (!machineId) {
      throw new Error('machineId is required');
    }
    try {
      return await this.oeeService.generateSampleData(machineId);
    } catch (error) {
      throw error;
    }
  }

  @Post('clear-data')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Limpar todos os dados OEE de uma máquina' })
  async clearData(@Query('machineId') machineId: string) {
    if (!machineId) {
      throw new Error('machineId is required');
    }
    await this.oeeService.clearMachineData(machineId);
    return { message: `All OEE data cleared for machine ${machineId}` };
  }
}

