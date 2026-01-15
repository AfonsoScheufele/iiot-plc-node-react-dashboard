import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModbusService } from './modbus.service';
import { ModbusConfig } from './modbus-config.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Modbus')
@Controller('modbus')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ModbusController {
  constructor(private readonly modbusService: ModbusService) {}

  @Get('configs')
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Listar todas as configurações Modbus' })
  async findAll() {
    return this.modbusService.findAllConfigs();
  }

  @Get('configs/:id')
  @Roles('admin', 'operator', 'viewer')
  @ApiOperation({ summary: 'Obter configuração Modbus por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modbusService.findConfigById(id);
  }

  @Post('configs')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Criar nova configuração Modbus' })
  async create(@Body() configData: Partial<ModbusConfig>) {
    return this.modbusService.createConfig(configData);
  }

  @Put('configs/:id')
  @Roles('admin', 'operator')
  @ApiOperation({ summary: 'Atualizar configuração Modbus' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() configData: Partial<ModbusConfig>,
  ) {
    return this.modbusService.updateConfig(id, configData);
  }

  @Delete('configs/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Deletar configuração Modbus' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.modbusService.deleteConfig(id);
    return { message: 'Configuração Modbus deletada com sucesso' };
  }
}

