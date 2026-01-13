import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MachinesService } from './machines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Machines')
@Controller('machines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as máquinas' })
  async findAll() {
    return this.machinesService.findAll();
  }
}


