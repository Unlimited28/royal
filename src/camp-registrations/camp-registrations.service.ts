import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { CampRegistration } from '../schemas/camp-registration.schema';
import type { CampRegistrationDocument } from '../schemas/camp-registration.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class CampRegistrationsService {
  constructor(
    @InjectModel(CampRegistration.name) private registrationModel: Model<CampRegistrationDocument>,
    private usersService: UsersService,
  ) {}

  async registerIndividual(userId: string, campId: string) {
    const existing = await this.registrationModel.findOne({
      userId: new Types.ObjectId(userId),
      campId: new Types.ObjectId(campId)
    });

    if (existing) throw new ConflictException('Already registered for this camp');

    const registration = new this.registrationModel({
      userId: new Types.ObjectId(userId),
      campId: new Types.ObjectId(campId),
      registrationType: 'individual',
      status: 'pending'
    });

    return registration.save();
  }

  async processBulkUpload(filePath: string, campId: string, adminId: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new BadRequestException('Invalid Excel file');

    const registrations = [];
    const errors = [];

    // Assuming first row is header. Columns: Email, Full Name (optional)
    worksheet.eachRow(async (row, rowNumber) => {
      if (rowNumber === 1) return;

      const email = row.getCell(1).text?.trim();
      if (!email) return;

      try {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
          errors.push({ row: rowNumber, error: `User with email ${email} not found` });
          return;
        }

        const existing = await this.registrationModel.findOne({
          userId: user._id,
          campId: new Types.ObjectId(campId)
        });

        if (existing) {
          errors.push({ row: rowNumber, error: `User ${email} already registered` });
          return;
        }

        const reg = new this.registrationModel({
          userId: user._id,
          campId: new Types.ObjectId(campId),
          registrationType: 'bulk',
          status: 'confirmed', // Assuming bulk admin uploads are pre-confirmed or confirmed by upload
          uploadedBy: new Types.ObjectId(adminId)
        });
        registrations.push(reg);
      } catch (err: any) {
        errors.push({ row: rowNumber, error: `Error processing row: ${err.message}` });
      }
    });

    // Wait for all rows to be processed (the eachRow is not naturally async-await friendly for the whole process)
    // Actually eachRow is synchronous in its iteration but we can use a loop.

    // Let's rewrite the processing to be truly async.
    return this.processRows(worksheet, campId, adminId);
  }

  private async processRows(worksheet: ExcelJS.Worksheet, campId: string, adminId: string) {
    const registrations = [];
    const errors = [];
    const rows: { row: ExcelJS.Row; rowNumber: number }[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) rows.push({ row, rowNumber });
    });

    for (const { row, rowNumber } of rows) {
      const email = row.getCell(1).text?.trim();
      if (!email) continue;

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        errors.push({ row: rowNumber, error: `User with email ${email} not found` });
        continue;
      }

      const existing = await this.registrationModel.findOne({
        userId: user._id,
        campId: new Types.ObjectId(campId)
      });

      if (existing) {
        errors.push({ row: rowNumber, error: `User ${email} already registered` });
        continue;
      }

      registrations.push({
        userId: user._id,
        campId: new Types.ObjectId(campId),
        registrationType: 'bulk',
        status: 'confirmed',
        uploadedBy: new Types.ObjectId(adminId)
      });
    }

    if (registrations.length > 0) {
      await this.registrationModel.insertMany(registrations);
    }

    return {
      successCount: registrations.length,
      errors
    };
  }

  async findAll(campId?: string) {
    const filter = campId ? { campId: new Types.ObjectId(campId) } : {};
    return this.registrationModel.find(filter)
      .populate('userId', 'firstName lastName email userCode')
      .populate('campId', 'title year type')
      .exec();
  }

  async findByUserId(userId: string) {
    return this.registrationModel.find({ userId: new Types.ObjectId(userId) })
      .populate('campId', 'title year type fee')
      .exec();
  }

  async updateStatus(id: string, status: string) {
    return this.registrationModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
