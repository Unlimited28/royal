import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { ExamResult, ExamResultSchema } from '../schemas/exam-result.schema';
import { CampRegistration, CampRegistrationSchema } from '../schemas/camp-registration.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
      { name: CampRegistration.name, schema: CampRegistrationSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
