import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Organization {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  code!: string; // e.g., 'OGUN-ASSOC-01'

  @Prop({
    required: true,
    enum: ['association', 'conference', 'unit'],
    default: 'association'
  })
  type!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: '#000080' }) // Default Navy
  primaryColor!: string;

  @Prop({ default: '#D4AF37' }) // Default Gold
  accentColor!: string;

  @Prop()
  address?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] })
  status!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  president?: mongoose.Types.ObjectId; // Reference to the Association President

  @Prop({ type: Object })
  settings?: Record<string, any>; // Flexible settings for the organization
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Indexes
OrganizationSchema.index({ code: 1 });
OrganizationSchema.index({ status: 1 });
