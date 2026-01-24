import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Role {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true })
  organization?: mongoose.Types.ObjectId;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isSystemRole!: boolean; // Prevent deletion of core roles
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Composite index for uniqueness within an organization if needed,
// or global uniqueness if organization is null.
RoleSchema.index({ slug: 1, organization: 1 }, { unique: true });
