import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { Payment } from '../schemas/payment.schema';
import type { PaymentDocument } from '../schemas/payment.schema';
import { ExamResult } from '../schemas/exam-result.schema';
import type { ExamResultDocument } from '../schemas/exam-result.schema';
import { CampRegistration } from '../schemas/camp-registration.schema';
import type { CampRegistrationDocument } from '../schemas/camp-registration.schema';
import { ExportQueryDto } from './dto/export-query.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ExportsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(ExamResult.name) private resultModel: Model<ExamResultDocument>,
    @InjectModel(CampRegistration.name) private registrationModel: Model<CampRegistrationDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async createWorkbook(sheetName: string, columns: any[], data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
    worksheet.addRows(data);
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach(column => {
        column.width = column.header ? (column.header as string).length + 10 : 20;
    });
    return workbook;
  }

  private applyFilters(query: ExportQueryDto, dateField = 'createdAt') {
    const filter: any = {};
    if (query.startDate || query.endDate) {
      filter[dateField] = {};
      if (query.startDate) filter[dateField].$gte = new Date(query.startDate);
      if (query.endDate) filter[dateField].$lte = new Date(query.endDate);
    }
    if (query.status) filter.status = query.status;
    if (query.associationId) filter.association = new Types.ObjectId(query.associationId);
    return filter;
  }

  async exportUsers(query: ExportQueryDto, adminId: string, adminRole: string) {
    const filter = this.applyFilters(query);
    const users = await this.userModel.find(filter).populate('association').exec();
    const data = users.map(u => ({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      userCode: u.userCode,
      rank: u.rank,
      association: (u.association as any)?.name,
      status: u.status,
      createdAt: (u as any).createdAt,
    }));
    const columns = [
      { header: 'First Name', key: 'firstName' },
      { header: 'Last Name', key: 'lastName' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Unique ID', key: 'userCode' },
      { header: 'Rank', key: 'rank' },
      { header: 'Association', key: 'association' },
      { header: 'Status', key: 'status' },
      { header: 'Joined Date', key: 'createdAt' },
    ];
    await this.logExport(adminId, adminRole, 'Users', filter);
    return this.createWorkbook('Users', columns, data);
  }

  async exportPayments(query: ExportQueryDto, adminId: string, adminRole: string) {
    let payments;
    if (query.associationId) {
        payments = await this.paymentModel.aggregate([
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $match: { 'user.association': new Types.ObjectId(query.associationId), ...this.applyFilters({ ...query, associationId: undefined }) } },
        ]);
    } else {
        payments = await this.paymentModel.find(this.applyFilters(query)).populate('userId').exec();
    }
    const data = payments.map((p: any) => ({
      userName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : (p.user ? `${p.user.firstName} ${p.user.lastName}` : 'N/A'),
      userCode: p.userId?.userCode || p.user?.userCode || 'N/A',
      type: p.type,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
    }));
    const columns = [
      { header: 'User', key: 'userName' },
      { header: 'Unique ID', key: 'userCode' },
      { header: 'Type', key: 'type' },
      { header: 'Amount', key: 'amount' },
      { header: 'Status', key: 'status' },
      { header: 'Date', key: 'createdAt' },
    ];
    await this.logExport(adminId, adminRole, 'Payments', query);
    return this.createWorkbook('Payments', columns, data);
  }

  async exportExamResults(query: ExportQueryDto, adminId: string, adminRole: string) {
    if (query.associationId) {
        const results = await this.resultModel.aggregate([
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $match: { 'user.association': new Types.ObjectId(query.associationId) } },
            { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
            { $unwind: '$exam' },
        ]);
        const data = results.map((r: any) => ({
            userName: `${r.user.firstName} ${r.user.lastName}`,
            userCode: r.user.userCode,
            examTitle: r.exam.title,
            score: r.score,
            passed: r.passed ? 'PASSED' : 'FAILED',
        }));
        const columns = [{ header: 'User', key: 'userName' }, { header: 'ID', key: 'userCode' }, { header: 'Exam', key: 'examTitle' }, { header: 'Score', key: 'score' }, { header: 'Result', key: 'passed' }];
        await this.logExport(adminId, adminRole, 'ExamResults', query);
        return this.createWorkbook('ExamResults', columns, data);
    } else {
        const results = await this.resultModel.find().populate('userId').populate('examId').exec();
        const data = results.map((r: any) => ({
            userName: r.userId ? `${(r.userId as any).firstName} ${(r.userId as any).lastName}` : 'N/A',
            userCode: (r.userId as any)?.userCode || 'N/A',
            examTitle: (r.examId as any)?.title || 'N/A',
            score: r.score,
            passed: r.passed ? 'PASSED' : 'FAILED',
        }));
        const columns = [{ header: 'User', key: 'userName' }, { header: 'ID', key: 'userCode' }, { header: 'Exam', key: 'examTitle' }, { header: 'Score', key: 'score' }, { header: 'Result', key: 'passed' }];
        await this.logExport(adminId, adminRole, 'ExamResults', query);
        return this.createWorkbook('ExamResults', columns, data);
    }
  }

  async exportCampParticipants(query: ExportQueryDto, adminId: string, adminRole: string) {
    const filter = this.applyFilters(query);
    const registrations = await this.registrationModel.find(filter).populate('userId').populate('campId').exec();
    const data = registrations.map((r: any) => ({
      userName: r.userId ? `${(r.userId as any).firstName} ${(r.userId as any).lastName}` : r.rawData?.fullName || 'N/A',
      userCode: (r.userId as any)?.userCode || r.rawData?.userCode || 'N/A',
      campName: (r.campId as any)?.name || 'N/A',
      status: r.status,
      createdAt: r.createdAt,
    }));
    const columns = [
      { header: 'Participant', key: 'userName' },
      { header: 'ID', key: 'userCode' },
      { header: 'Camp', key: 'campName' },
      { header: 'Status', key: 'status' },
      { header: 'Date', key: 'createdAt' },
    ];
    await this.logExport(adminId, adminRole, 'CampParticipants', filter);
    return this.createWorkbook('CampParticipants', columns, data);
  }

  private async logExport(adminId: string, adminRole: string, type: string, filters: any) {
    await this.auditLogService.recordAction({
      action: 'DATA_EXPORT',
      actorId: adminId,
      actorRole: adminRole,
      targetType: type,
      targetId: 'system',
      metadata: { filters },
    });
  }
}
