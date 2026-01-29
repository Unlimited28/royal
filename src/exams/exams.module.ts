import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { Exam, ExamSchema } from '../schemas/exam.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { ExamAttempt, ExamAttemptSchema } from '../schemas/exam-attempt.schema';
import { ExamResult, ExamResultSchema } from '../schemas/exam-result.schema';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: ExamAttempt.name, schema: ExamAttemptSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
    ]),
    SystemSettingsModule,
    AuditLogModule,
  ],
  providers: [ExamsService],
  controllers: [ExamsController],
  exports: [ExamsService],
})
export class ExamsModule {}
