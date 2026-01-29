import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';

@ApiTags('Media Center')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active media (Public)' })
  findAllPublic() {
    return this.mediaService.findAll(true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new media entry (Super Admin only)' })
  create(@Body() mediaData: CreateMediaDto) {
    return this.mediaService.create(mediaData);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all media including inactive (Super Admin only)' })
  findAllAdmin() {
    return this.mediaService.findAll(false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a media entry (Super Admin only)' })
  update(@Param('id') id: string, @Body() updateData: UpdateMediaDto) {
    return this.mediaService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a media entry (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
