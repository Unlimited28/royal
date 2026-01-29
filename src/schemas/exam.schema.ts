import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  targetRank!: string;

  @Prop({ required: true, default: 45 })
  duration_minutes!: number;

  @Prop({ required: true, default: 60 })
  pass_score!: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }] })
  questions!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
