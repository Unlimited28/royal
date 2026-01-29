import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingDocument = SystemSetting & Document;

@Schema({ timestamps: true })
export class SystemSetting {
  @Prop({ required: true, unique: true, trim: true })
  key!: string;

  @Prop({ type: Object, required: true })
  value!: any;

  @Prop()
  description?: string;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);
