import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('CMS - Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a blog post (Super Admin only)' })
  create(@Body() data: any, @Request() req: any) {
    return this.blogService.create(data, req.user.userId, req.user.roles[0]);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts' })
  findAll(@Query('status') status?: string) {
    return this.blogService.findAll(status);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get blog post by ID or Slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.blogService.findOne(idOrSlug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post (Super Admin only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.blogService.update(id, data, req.user.userId, req.user.roles[0]);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post (Super Admin only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.blogService.remove(id, req.user.userId, req.user.roles[0]);
  }
}
