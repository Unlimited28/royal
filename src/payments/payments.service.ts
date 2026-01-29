/// <reference types="multer" />
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from '../schemas/payment.schema';
import type { PaymentDocument } from '../schemas/payment.schema';
import type { CreatePaymentDto } from './dto/payment.dto';
import { StorageService } from '../common/storage/storage.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly storageService: StorageService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(paymentData: CreatePaymentDto, userId: string, file: Express.Multer.File) {
    const fileMetadata = await this.storageService.saveFile(file, 'receipts');

    const newPayment = new this.paymentModel({
      userId: new Types.ObjectId(userId),
      type: paymentData.type,
      amount: Number(paymentData.amount),
      referenceNote: paymentData.referenceNote,
      receiptUrl: fileMetadata.url,
      fileMetadata: fileMetadata,
      status: 'pending',
    });

    return newPayment.save();
  }

  async findAll() {
    return this.paymentModel.find()
      .populate('userId', 'firstName lastName email userCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string) {
    return this.paymentModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAssociation(associationId: string) {
    return this.paymentModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.association': new Types.ObjectId(associationId) } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          type: 1,
          amount: 1,
          receiptUrl: 1,
          referenceNote: 1,
          status: 1,
          createdAt: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1,
          'user.userCode': 1,
        }
      }
    ]);
  }

  async verifyPayment(paymentId: string, adminId: string, adminRole: string, status: 'approved' | 'rejected', reason?: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== 'pending' && adminRole !== 'superadmin') {
      throw new BadRequestException(`Only Super Admin can override a ${payment.status} payment`);
    }

    const previousStatus = payment.status;
    payment.status = status;
    payment.verifiedBy = new Types.ObjectId(adminId);
    payment.verifiedAt = new Date();
    if (reason) payment.rejectionReason = reason;

    const savedPayment = await payment.save();

    // Audit log
    await this.auditLogService.recordAction({
      action: status === 'approved' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Payment',
      targetId: paymentId,
      metadata: {
        previousStatus,
        reason,
        amount: payment.amount,
        type: payment.type,
      },
    });

    // Notification
    await this.notificationsService.create({
      userId: payment.userId,
      type: 'payment_status',
      title: `Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: status === 'approved'
        ? `Your payment of ${payment.amount} for ${payment.type} has been approved.`
        : `Your payment of ${payment.amount} for ${payment.type} was rejected. Reason: ${reason}`,
      metadata: { paymentId, status },
    });

    return savedPayment;
  }

  async getStats() {
    return this.paymentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
  }

  async getStatsByAssociation(associationId: string) {
    return this.paymentModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.association': new Types.ObjectId(associationId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
  }
}
