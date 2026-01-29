import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@ApiTags('Announcements')
@Controller('announcements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get active announcements for the current user' })
  findForUser(@Req() req: any) {
    return this.announcementsService.findForUser(req.user.userId, req.user.roles, req.user.associationId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark an announcement as read/dismissed' })
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.announcementsService.markAsRead(id, req.user.userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create a new announcement (Super Admin only)' })
  create(@Body() createDto: CreateAnnouncementDto, @Req() req: any) {
    return this.announcementsService.create(createDto, req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Get all announcements (Super Admin only)' })
  findAllAdmin() {
    return this.announcementsService.findAllAdmin();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update an announcement (Super Admin only)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete an announcement (Super Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.announcementsService.remove(id, req.user.userId, req.user.roles[0]);
  }
}
