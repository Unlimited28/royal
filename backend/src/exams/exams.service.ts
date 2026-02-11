import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Exam } from '@schemas/exam.schema';
import type { ExamDocument } from '@schemas/exam.schema';
import { Question } from '@schemas/question.schema';
import type { QuestionDocument } from '@schemas/question.schema';
import { ExamAttempt } from '@schemas/exam-attempt.schema';
import type { ExamAttemptDocument } from '@schemas/exam-attempt.schema';
import { ExamResult } from '@schemas/exam-result.schema';
import type { ExamResultDocument } from '@schemas/exam-result.schema';
import { ExamApproval } from '@schemas/exam-approval.schema';
import type { ExamApprovalDocument } from '@schemas/exam-approval.schema';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(ExamAttempt.name) private attemptModel: Model<ExamAttemptDocument>,
    @InjectModel(ExamResult.name) private resultModel: Model<ExamResultDocument>,
    @InjectModel(ExamApproval.name) private approvalModel: Model<ExamApprovalDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createExamDto: CreateExamDto, userId: string, userRole: string) {
    const { questions, ...examData } = createExamDto;

    const newExam = new this.examModel({
      ...examData,
      createdBy: new Types.ObjectId(userId),
    });
    const savedExam = await newExam.save();

    const questionDocs = questions.map(q => ({
      ...q,
      examId: savedExam._id,
    }));
    const savedQuestions = await this.questionModel.insertMany(questionDocs);

    savedExam.questions = savedQuestions.map(q => q._id as Types.ObjectId);
    const result = await savedExam.save();

    await this.auditLogService.recordAction({
      action: 'EXAM_CREATED',
      actorId: userId,
      actorRole: userRole,
      targetType: 'Exam',
      targetId: result._id as any,
      metadata: { title: result.title, targetRank: result.targetRank },
    });

    return result;
  }

  async update(examId: string, updateDto: any, userId: string, userRole: string) {
    const exam = await this.examModel.findByIdAndUpdate(examId, updateDto, { new: true });
    if (!exam) throw new NotFoundException('Exam not found');

    await this.auditLogService.recordAction({
      action: 'EXAM_UPDATED',
      actorId: userId,
      actorRole: userRole,
      targetType: 'Exam',
      targetId: examId as any,
      metadata: { updateData: updateDto },
    });

    return exam;
  }

  async findAll() {
    return this.examModel.find().populate('questions').exec();
  }

  async findOne(id: string) {
    const exam = await this.examModel.findById(id).populate('questions').exec();
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async startAttempt(examId: string, userId: string) {
    const exam = await this.findOne(examId);

    // Check if there is already an active attempt
    const activeAttempt = await this.attemptModel.findOne({
      userId: new Types.ObjectId(userId),
      examId: new Types.ObjectId(examId),
      status: 'in-progress'
    });

    if (activeAttempt) {
      // Check if it's already expired
      const now = new Date();
      const startTime = new Date(activeAttempt.startedAt);
      const durationMs = exam.duration_minutes * 60 * 1000;
      const bufferMs = 30 * 1000; // 30 seconds buffer for auto-submit

      if (now.getTime() > startTime.getTime() + durationMs + bufferMs) {
        // Force submission of expired attempt
        return this.submitAttempt(activeAttempt._id.toString(), activeAttempt.answers || {});
      }
      return activeAttempt;
    }

    const newAttempt = new this.attemptModel({
      userId: new Types.ObjectId(userId),
      examId: new Types.ObjectId(examId),
      startedAt: new Date(),
      status: 'in-progress'
    });
    return newAttempt.save();
  }

  async submitAttempt(attemptId: string, answers: Record<string, number>) {
    const attempt = await this.attemptModel.findById(attemptId);
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'in-progress') throw new BadRequestException('Attempt already submitted');

    const exam = await this.examModel.findById(attempt.examId);
    if (!exam) throw new NotFoundException('Exam not found');

    const now = new Date();
    const startTime = new Date(attempt.startedAt);
    const durationMs = exam.duration_minutes * 60 * 1000;
    const bufferMs = 10 * 1000; // 10 seconds buffer

    if (now.getTime() > startTime.getTime() + durationMs + bufferMs) {
        attempt.status = 'AUTO_SUBMITTED';
        attempt.late = true;
        attempt.autoSubmittedAt = now;
    } else {
        attempt.status = 'submitted';
    }

    attempt.answers = answers;
    attempt.submittedAt = now;
    await attempt.save();

    return this.gradeAttempt(attempt);
  }

  private async gradeAttempt(attempt: ExamAttemptDocument) {
    const examDoc = await this.examModel.findById(attempt.examId).populate('questions');
    if (!examDoc) throw new NotFoundException('Exam not found');

    let totalPoints = 0;
    let earnedPoints = 0;

    const questions = examDoc.questions as unknown as QuestionDocument[];
    for (const question of questions) {
      totalPoints += question.points || 1;
      const userAnswer = attempt.answers[question._id.toString()];
      if (userAnswer === question.correctAnswer) {
        earnedPoints += question.points || 1;
      }
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= examDoc.pass_score;

    attempt.score = score;
    attempt.passed = passed;
    if (attempt.status !== 'AUTO_SUBMITTED') {
        attempt.status = 'graded';
    }
    await attempt.save();

    // Create a result (unpublished by default)
    const result = new this.resultModel({
      attemptId: attempt._id,
      userId: attempt.userId,
      examId: attempt.examId,
      score,
      passed,
      isPublished: false
    });
    await result.save();

    return { score, passed, resultId: result._id };
  }

  async publishResult(resultId: string, adminId: string, adminRole: string) {
    const result = await this.resultModel.findById(resultId);
    if (!result) throw new NotFoundException('Result not found');

    result.isPublished = true;
    result.publishedBy = new Types.ObjectId(adminId);
    result.publishedAt = new Date();
    const savedResult = await result.save();

    await this.auditLogService.recordAction({
      action: 'EXAM_RESULT_PUBLISHED',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'ExamResult',
      targetId: resultId as any,
      metadata: { userId: result.userId, examId: result.examId, score: result.score },
    });

    return savedResult;
  }

  async getResults(userId?: string) {
    const filter = userId ? { userId: new Types.ObjectId(userId), isPublished: true } : {};
    return this.resultModel.find(filter)
      .populate('examId', 'title')
      .populate('userId', 'firstName lastName email userCode')
      .exec();
  }

  async unpublishResult(resultId: string, adminId: string, adminRole: string) {
    const result = await this.resultModel.findById(resultId);
    if (!result) throw new NotFoundException('Result not found');

    result.isPublished = false;
    const savedResult = await result.save();

    await this.auditLogService.recordAction({
      action: 'EXAM_RESULT_UNPUBLISHED',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'ExamResult',
      targetId: resultId as any,
      metadata: { userId: result.userId, examId: result.examId },
    });

    return savedResult;
  }

  async getApprovals(associationId?: string) {
    const filter = associationId ? { associationId: new Types.ObjectId(associationId) } : {};
    return this.approvalModel.find(filter)
        .populate('ambassadorId', 'firstName lastName email userCode')
        .sort({ createdAt: -1 })
        .exec();
  }

  async updateApprovalStatus(approvalId: string, status: string, adminId: string, adminRole: string) {
    const approval = await this.approvalModel.findById(approvalId);
    if (!approval) throw new NotFoundException('Approval request not found');

    approval.status = status;
    approval.approvedBy = new Types.ObjectId(adminId);
    approval.approvedAt = new Date();
    await approval.save();

    await this.auditLogService.recordAction({
      action: `EXAM_APPROVAL_${status.toUpperCase()}`,
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'ExamApproval',
      targetId: approvalId as any,
      metadata: { ambassadorId: approval.ambassadorId, nextRank: approval.nextRank },
    });

    return approval;
  }

  async removeExam(examId: string, adminId: string, adminRole: string) {
    const exam = await this.examModel.findById(examId);
    if (!exam) throw new NotFoundException('Exam not found');

    // Soft delete or hard delete? Let's do hard delete for now but log it.
    // In production we might want isActive: false
    exam.isActive = false;
    await exam.save();

    await this.auditLogService.recordAction({
      action: 'EXAM_DELETED',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Exam',
      targetId: examId as any,
      metadata: { title: exam.title },
    });

    return { message: 'Exam deactivated successfully' };
  }

  async cleanupExpiredAttempts() {
    const inProgressAttempts = await this.attemptModel.find({ status: 'in-progress' });
    let count = 0;
    for (const attempt of inProgressAttempts) {
        const exam = await this.examModel.findById(attempt.examId);
        if (!exam) continue;

        const now = new Date();
        const startTime = new Date(attempt.startedAt);
        const durationMs = exam.duration_minutes * 60 * 1000;
        const bufferMs = 60 * 1000; // 1 minute buffer for background cleanup

        if (now.getTime() > startTime.getTime() + durationMs + bufferMs) {
            await this.submitAttempt(attempt._id.toString(), attempt.answers || {});
            count++;
        }
    }
    return { cleanedCount: count };
  }
}
