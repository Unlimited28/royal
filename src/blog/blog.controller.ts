import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query, UseInterceptors, UploadedFile, Req
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogService } from './blog.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BLOG_COVER_UPLOAD_OPTIONS } from '../common/storage/storage.utils';
import { StorageService } from '../common/storage/storage.service';

@ApiTags('Blog / News')
@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all published blogs (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllPublic(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAll({ status: 'published', page, limit, search });
  }

  @Get('slug/:slug')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get a blog by slug (Public)' })
  findOne(@Param('slug') slug: string) {
    return this.blogService.findOneBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage', BLOG_COVER_UPLOAD_OPTIONS))
  @ApiOperation({ summary: 'Create a new blog (Super Admin only)' })
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverImageUrl;
    if (file) {
      const fileMetadata = await this.storageService.saveFile(file, 'blogs' as any);
      coverImageUrl = fileMetadata.url;
    }
    return this.blogService.create(createBlogDto, req.user.userId, coverImageUrl);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blogs including drafts (Super Admin only)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAll({ status, page, limit, search });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage', BLOG_COVER_UPLOAD_OPTIONS))
  @ApiOperation({ summary: 'Update a blog (Super Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverImageUrl;
    if (file) {
      const fileMetadata = await this.storageService.saveFile(file, 'blogs' as any);
      coverImageUrl = fileMetadata.url;
    }
    return this.blogService.update(id, updateBlogDto, coverImageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog (Super Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.blogService.remove(id, req.user.userId, req.user.roles[0]);
  }
}
