import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Listar alertas' })
  @ApiQuery({ name: 'machineId', required: false })
  @ApiQuery({ name: 'resolved', required: false, type: Boolean })
  async findAll(
    @Query('machineId') machineId?: string,
    @Query('resolved') resolved?: string,
  ) {
    const resolvedBool = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
    return this.alertsService.findAll(machineId, resolvedBool);
  }

  @Post(':id/resolve')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Resolver um alerta' })
  async resolve(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.resolve(id);
  }
}



