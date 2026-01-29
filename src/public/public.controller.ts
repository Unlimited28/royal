import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateHomepageSectionDto, UpdateHomepageSectionDto } from './dto/homepage-section.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Public Platform')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('homepage')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get active homepage sections (Public)' })
  findActiveSections() {
    return this.publicService.findActiveSections();
  }

  @Post('homepage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a homepage section (Super Admin only)' })
  createSection(@Body() createDto: CreateHomepageSectionDto) {
    return this.publicService.createSection(createDto);
  }

  @Get('homepage/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all homepage sections (Super Admin only)' })
  findAllSections() {
    return this.publicService.findAllSections();
  }

  @Patch('homepage/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a homepage section (Super Admin only)' })
  updateSection(@Param('id') id: string, @Body() updateDto: UpdateHomepageSectionDto) {
    return this.publicService.updateSection(id, updateDto);
  }

  @Delete('homepage/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a homepage section (Super Admin only)' })
  removeSection(@Param('id') id: string) {
    return this.publicService.removeSection(id);
  }
}
