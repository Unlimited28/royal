import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  examId!: Types.ObjectId;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [String], required: true, validate: [(val: string[]) => val.length === 4, 'Must have 4 options'] })
  options!: string[];

  @Prop({ required: true, min: 0, max: 3 })
  correctAnswer!: number; // 0 for A, 1 for B, 2 for C, 3 for D

  @Prop({ default: 1 })
  points!: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
