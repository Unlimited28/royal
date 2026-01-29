import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from '../schemas/payment.schema';
import type { PaymentDocument } from '../schemas/payment.schema';
import type { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(paymentData: CreatePaymentDto & { userId: string }) {
    const newPayment = new this.paymentModel(paymentData);
    return newPayment.save();
  }

  async findAll() {
    return this.paymentModel.find().populate('userId', 'firstName lastName email userCode').exec();
  }

  async findByUserId(userId: string) {
    return this.paymentModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async verifyPayment(paymentId: string, adminId: string, status: 'approved' | 'rejected', reason?: string) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    payment.verifiedBy = new Types.ObjectId(adminId);
    payment.verifiedAt = new Date();
    if (reason) payment.rejectionReason = reason;

    return payment.save();
  }
}
