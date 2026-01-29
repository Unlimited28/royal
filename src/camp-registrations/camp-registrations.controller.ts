import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CampRegistrationsService } from './camp-registrations.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesService } from '../files/files.service';

@ApiTags('Camp Registrations')
@Controller('camp-registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampRegistrationsController {
  constructor(private readonly registrationsService: CampRegistrationsService) {}

  @Post('register')
  @Roles('ambassador')
  @ApiOperation({ summary: 'Register current user for a camp' })
  register(@Body('campId') campId: string, @Request() req: any) {
    return this.registrationsService.registerIndividual(req.user.userId, campId);
  }

  @Post('bulk-upload')
  @Roles('president', 'superadmin')
  @UseInterceptors(FileInterceptor('file', {
    storage: FilesService.getStorageOptions('excel'),
    fileFilter: FilesService.fileFilter(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        campId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Bulk register users via Excel upload' })
  bulkUpload(@Body('campId') campId: string, @UploadedFile() file: any, @Request() req: any) {
    return this.registrationsService.processBulkUpload(file.path, campId, req.user.userId);
  }

  @Get('my')
  @Roles('ambassador')
  @ApiOperation({ summary: 'Get current user camp registrations' })
  getMyRegistrations(@Request() req: any) {
    return this.registrationsService.findByUserId(req.user.userId);
  }

  @Get('camp/:campId')
  @Roles('president', 'superadmin')
  @ApiOperation({ summary: 'Get all registrations for a camp' })
  getByCamp(@Param('campId') campId: string) {
    return this.registrationsService.findAll(campId);
  }

  @Patch(':id/status')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update registration status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.registrationsService.updateStatus(id, status);
  }
}
