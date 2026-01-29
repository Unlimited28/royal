import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Exams')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create a new exam (Super Admin only)' })
  create(@Body() createExamDto: CreateExamDto, @Request() req: any) {
    return this.examsService.create(createExamDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exams' })
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Post(':id/start')
  @Roles('ambassador')
  @ApiOperation({ summary: 'Start an exam attempt' })
  startAttempt(@Param('id') id: string, @Request() req: any) {
    return this.examsService.startAttempt(id, req.user.userId);
  }

  @Post('attempts/:id/submit')
  @Roles('ambassador')
  @ApiOperation({ summary: 'Submit an exam attempt' })
  submitAttempt(@Param('id') id: string, @Body('answers') answers: Record<string, number>) {
    return this.examsService.submitAttempt(id, answers);
  }

  @Post('results/:id/publish')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Publish exam result (Super Admin only)' })
  publishResult(@Param('id') id: string, @Request() req: any) {
    return this.examsService.publishResult(id, req.user.userId, req.user.roles[0]);
  }

  @Post('results/:id/unpublish')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Unpublish exam result (Super Admin only)' })
  unpublishResult(@Param('id') id: string, @Request() req: any) {
    return this.examsService.unpublishResult(id, req.user.userId, req.user.roles[0]);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete an exam (Super Admin only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.examsService.removeExam(id, req.user.userId, req.user.roles[0]);
  }

  @Get('results/my')
  @Roles('ambassador')
  @ApiOperation({ summary: 'Get my published results' })
  getMyResults(@Request() req: any) {
    return this.examsService.getResults(req.user.userId);
  }
}
