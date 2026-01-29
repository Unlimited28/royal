import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CampsService } from './camps.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Camps')
@Controller('camps')
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active camps (Public)' })
  findActive() {
    return this.campsService.findActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new camp (Super Admin only)' })
  create(@Body() campData: any) {
    return this.campsService.create(campData);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all camps including inactive (Super Admin only)' })
  findAll() {
    return this.campsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a camp (Super Admin only)' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.campsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a camp (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.campsService.remove(id);
  }
}
