import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('CMS - Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add gallery item (Super Admin only)' })
  create(@Body() data: any) {
    return this.galleryService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gallery items' })
  findAll() {
    return this.galleryService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete gallery item (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
