import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamAttemptDocument = ExamAttempt & Document;

@Schema({ timestamps: true })
export class ExamAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId!: Types.ObjectId;

  @Prop({ type: Object })
  answers!: Record<string, number>; // questionId -> selectedOptionIndex

  @Prop()
  score?: number;

  @Prop()
  passed?: boolean;

  @Prop({ default: 'in-progress', enum: ['in-progress', 'submitted', 'graded'] })
  status!: string;

  @Prop()
  startedAt!: Date;

  @Prop()
  submittedAt?: Date;
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);
