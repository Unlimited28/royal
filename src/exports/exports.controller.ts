import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportQueryDto } from './dto/export-query.dto';
import type { Response } from 'express';

@ApiTags('Exports')
@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  private async handleDownload(res: Response, workbook: any, filename: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }

  private enforceAssociation(query: ExportQueryDto, user: any) {
    if (user.roles.includes('president')) {
      query.associationId = user.associationId;
    }
  }

  @Get('users')
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Export users to Excel' })
  async exportUsers(@Query() query: ExportQueryDto, @Req() req: any, @Res() res: Response) {
    this.enforceAssociation(query, req.user);
    const workbook = await this.exportsService.exportUsers(query, req.user.userId, req.user.roles[0]);
    await this.handleDownload(res, workbook, `users_${Date.now()}`);
  }

  @Get('payments')
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Export payments to Excel' })
  async exportPayments(@Query() query: ExportQueryDto, @Req() req: any, @Res() res: Response) {
    this.enforceAssociation(query, req.user);
    const workbook = await this.exportsService.exportPayments(query, req.user.userId, req.user.roles[0]);
    await this.handleDownload(res, workbook, `payments_${Date.now()}`);
  }

  @Get('exams')
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Export exam results to Excel' })
  async exportExamResults(@Query() query: ExportQueryDto, @Req() req: any, @Res() res: Response) {
    this.enforceAssociation(query, req.user);
    const workbook = await this.exportsService.exportExamResults(query, req.user.userId, req.user.roles[0]);
    await this.handleDownload(res, workbook, `exam_results_${Date.now()}`);
  }

  @Get('camps')
  @Roles('superadmin', 'president')
  @ApiOperation({ summary: 'Export camp participants to Excel' })
  async exportCampParticipants(@Query() query: ExportQueryDto, @Req() req: any, @Res() res: Response) {
    this.enforceAssociation(query, req.user);
    const workbook = await this.exportsService.exportCampParticipants(query, req.user.userId, req.user.roles[0]);
    await this.handleDownload(res, workbook, `camp_participants_${Date.now()}`);
  }
}
