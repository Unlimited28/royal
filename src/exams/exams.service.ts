import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exam } from '../schemas/exam.schema';
import type { ExamDocument } from '../schemas/exam.schema';
import { Question } from '../schemas/question.schema';
import type { QuestionDocument } from '../schemas/question.schema';
import { ExamAttempt } from '../schemas/exam-attempt.schema';
import type { ExamAttemptDocument } from '../schemas/exam-attempt.schema';
import { ExamResult } from '../schemas/exam-result.schema';
import type { ExamResultDocument } from '../schemas/exam-result.schema';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(ExamAttempt.name) private attemptModel: Model<ExamAttemptDocument>,
    @InjectModel(ExamResult.name) private resultModel: Model<ExamResultDocument>,
  ) {}

  async create(createExamDto: CreateExamDto, userId: string) {
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
    return savedExam.save();
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
    await this.findOne(examId);

    // Check if there is already an active attempt
    const activeAttempt = await this.attemptModel.findOne({
      userId: new Types.ObjectId(userId),
      examId: new Types.ObjectId(examId),
      status: 'in-progress'
    });
    if (activeAttempt) return activeAttempt;

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

    attempt.answers = answers;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
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
    attempt.status = 'graded';
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

  async publishResult(resultId: string, adminId: string) {
    const result = await this.resultModel.findById(resultId);
    if (!result) throw new NotFoundException('Result not found');

    result.isPublished = true;
    result.publishedBy = new Types.ObjectId(adminId);
    result.publishedAt = new Date();
    return result.save();
  }

  async getResults(userId?: string) {
    const filter = userId ? { userId: new Types.ObjectId(userId), isPublished: true } : {};
    return this.resultModel.find(filter).populate('examId', 'title').exec();
  }
}
