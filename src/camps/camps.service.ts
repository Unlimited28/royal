/// <reference types="multer" />
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Camp } from '../schemas/camp.schema';
import type { CampDocument } from '../schemas/camp.schema';
import { CampRegistration } from '../schemas/camp-registration.schema';
import type { CampRegistrationDocument } from '../schemas/camp-registration.schema';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { StorageService } from '../common/storage/storage.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CampsService {
  constructor(
    @InjectModel(Camp.name) private campModel: Model<CampDocument>,
    @InjectModel(CampRegistration.name) private registrationModel: Model<CampRegistrationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly storageService: StorageService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createCamp(data: any) {
    const camp = new this.campModel(data);
    return camp.save();
  }

  async findAllCamps() {
    return this.campModel.find().sort({ startDate: -1 }).exec();
  }

  async findCampById(id: string) {
    const camp = await this.campModel.findById(id).exec();
    if (!camp) throw new NotFoundException('Camp not found');
    return camp;
  }

  async uploadRegistrations(campId: string, associationId: string, adminId: string, adminRole: string, file: Express.Multer.File) {
    const camp = await this.findCampById(campId);
    const fileMetadata = await this.storageService.saveFile(file, 'excel');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    const rows: any[] = [];
    worksheet?.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push({
          rowNumber,
          fullName: row.getCell(1).text?.trim(),
          association: row.getCell(2).text?.trim(),
          church: row.getCell(3).text?.trim(),
          rank: row.getCell(4).text?.trim(),
          userCode: row.getCell(5).text?.trim(),
          email: row.getCell(6).text?.trim(),
        });
      }
    });

    for (const rowData of rows) {
      const { rowNumber, fullName, association, church, rank, userCode, email } = rowData;

      if (!fullName || !association || !church || !rank) {
        results.failed++;
        results.errors.push({ row: rowNumber, error: 'Missing required columns (Full Name, Association, Church, Rank)' });
        continue;
      }

      try {
        let user = null;
        if (userCode) {
          user = await this.userModel.findOne({ userCode });
        } else if (email) {
          user = await this.userModel.findOne({ email });
        }

        const registrationData: any = {
          campId: camp._id,
          associationId: new Types.ObjectId(associationId),
          registeredBy: new Types.ObjectId(adminId),
          source: 'EXCEL_UPLOAD',
          status: 'APPROVED',
          rawData: {
            fullName,
            association,
            church,
            rank,
            userCode,
            email,
          },
        };

        if (user) {
          registrationData.userId = user._id;
          registrationData.unmatched = false;
        } else {
          registrationData.unmatched = true;
        }

        const duplicateFilter: any = { campId: camp._id };
        if (user) {
          duplicateFilter.userId = user._id;
        } else {
          duplicateFilter.unmatched = true;
          duplicateFilter['rawData.fullName'] = fullName;
          duplicateFilter['rawData.church'] = church;
        }

        const existing = await this.registrationModel.findOne(duplicateFilter);

        if (existing) {
          results.failed++;
          results.errors.push({ row: rowNumber, error: 'Duplicate registration detected' });
          continue;
        }

        const registration = new this.registrationModel(registrationData);
        await registration.save();
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ row: rowNumber, error: error.message });
      }
    }

    await this.auditLogService.recordAction({
      action: 'CAMP_UPLOAD',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Camp',
      targetId: campId,
      metadata: {
        successful: results.successful,
        failed: results.failed,
        fileName: file.originalname,
        storagePath: fileMetadata.path,
      },
    });

    return results;
  }

  async getRegistrationsByCamp(campId: string, associationId?: string) {
    const filter: any = { campId: new Types.ObjectId(campId) };
    if (associationId) {
      filter.associationId = new Types.ObjectId(associationId);
    }
    return this.registrationModel.find(filter)
      .populate('userId', 'firstName lastName email userCode rank')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRegistrationsByUser(userId: string) {
    return this.registrationModel.find({ userId: new Types.ObjectId(userId) })
      .populate('campId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateRegistrationStatus(registrationId: string, status: string, adminId: string, adminRole: string) {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) throw new NotFoundException('Registration not found');

    const previousStatus = registration.status;
    registration.status = status;
    await registration.save();

    await this.auditLogService.recordAction({
      action: 'CAMP_REGISTRATION_OVERRIDE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'CampRegistration',
      targetId: registrationId,
      metadata: { previousStatus, newStatus: status },
    });

    return registration;
  }
}
