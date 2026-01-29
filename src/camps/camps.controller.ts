/// <reference types="multer" />
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CampsService } from './camps.service';
import { EXCEL_UPLOAD_OPTIONS } from '../common/storage/storage.utils';

@ApiTags('Camps')
@Controller('camps')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create a new camp (Super Admin only)' })
  async create(@Body() campData: any) {
    return this.campsService.createCamp(campData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all camps' })
  async findAll() {
    return this.campsService.findAllCamps();
  }

  @Post(':id/upload-registrations')
  @Roles('president', 'superadmin')
  @UseInterceptors(FileInterceptor('file', EXCEL_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload camp registrations from Excel' })
  async uploadRegistrations(
    @Param('id') campId: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Excel file is required and must be under 10MB');
    }
    const role = req.user.roles.includes('superadmin') ? 'superadmin' : 'president';
    return this.campsService.uploadRegistrations(
      campId,
      req.user.associationId,
      req.user.userId,
      role,
      file
    );
  }

  @Get(':id/registrations')
  @Roles('president', 'superadmin')
  @ApiOperation({ summary: 'Get registrations for a camp' })
  async getRegistrations(@Param('id') campId: string, @Request() req: any) {
    if (req.user.roles.includes('superadmin')) {
      return this.campsService.getRegistrationsByCamp(campId);
    } else {
      return this.campsService.getRegistrationsByCamp(campId, req.user.associationId);
    }
  }

  @Get('my-registrations')
  @Roles('ambassador', 'president')
  @ApiOperation({ summary: 'Get my camp registrations' })
  async getMyRegistrations(@Request() req: any) {
    return this.campsService.getRegistrationsByUser(req.user.userId);
  }

  @Patch('registrations/:id/status')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Override camp registration status (Super Admin only)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.campsService.updateRegistrationStatus(id, status, req.user.userId, 'superadmin');
  }
}
