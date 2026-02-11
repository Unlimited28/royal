import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('CMS - Announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'president')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an announcement' })
  create(@Body() data: any, @Request() req: any) {
    return this.announcementService.create(data, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get announcements (filtered by association if provided)' })
  findAll(@Query('associationId') associationId?: string) {
    return this.announcementService.findAll(associationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.announcementService.remove(id);
  }
}
