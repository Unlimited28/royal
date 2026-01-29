import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

@ApiTags('Corporate Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active ads for public/dashboard' })
  findActive() {
    return this.adsService.findActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ad (Super Admin only)' })
  create(@Body() adData: CreateAdDto) {
    return this.adsService.create(adData);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all ads (Super Admin only)' })
  findAll() {
    return this.adsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an ad (Super Admin only)' })
  update(@Param('id') id: string, @Body() updateData: UpdateAdDto) {
    return this.adsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an ad (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
