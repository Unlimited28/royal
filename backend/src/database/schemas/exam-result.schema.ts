import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamResultDocument = ExamResult & Document;

@Schema({ timestamps: true })
export class ExamResult {
  @Prop({ type: Types.ObjectId, ref: 'ExamAttempt', required: true })
  attemptId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
  examId!: Types.ObjectId;

  @Prop({ required: true })
  score!: number;

  @Prop({ required: true })
  passed!: boolean;

  @Prop({ default: false })
  isPublished!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  publishedBy?: Types.ObjectId;

  @Prop()
  publishedAt?: Date;
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);
