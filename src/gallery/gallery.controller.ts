import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Req
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GalleryService } from './gallery.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GALLERY_UPLOAD_OPTIONS } from '../common/storage/storage.utils';
import { StorageService } from '../common/storage/storage.service';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get gallery items (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'eventTag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('eventTag') eventTag?: string,
    @Query('search') search?: string,
  ) {
    return this.galleryService.findAll({ page, limit, eventTag, search });
  }

  @Get('tags')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all unique gallery tags (Public)' })
  getTags() {
    return this.galleryService.getTags();
  }

  @Get(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get a single gallery item (Public)' })
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', GALLERY_UPLOAD_OPTIONS))
  @ApiOperation({ summary: 'Upload a gallery item (Super Admin only)' })
  async create(
    @Body() createDto: CreateGalleryItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const fileMetadata = await this.storageService.saveFile(file, 'gallery' as any);
    return this.galleryService.create(createDto, fileMetadata.url, fileMetadata);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', GALLERY_UPLOAD_OPTIONS))
  @ApiOperation({ summary: 'Update a gallery item (Super Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGalleryItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl, fileMetadata;
    if (file) {
      fileMetadata = await this.storageService.saveFile(file, 'gallery' as any);
      imageUrl = fileMetadata.url;
    }
    return this.galleryService.update(id, updateDto, imageUrl, fileMetadata);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery item (Super Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.galleryService.remove(id, req.user.userId, req.user.roles[0]);
  }
}
