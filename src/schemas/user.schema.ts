import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
})
export class User {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, select: false }) // Hide password by default
  password!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  church?: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true
  })
  userCode!: string; // System-generated RA ID (e.g., OGBC//RA//2024//001)

  @Prop({ type: Number })
  age?: number;

  @Prop({
    default: 'Candidate',
    trim: true
  })
  rank!: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  })
  status!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] })
  roles!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organization!: Types.ObjectId;

  @Prop({ default: false })
  adminPasscodeUsed!: boolean;

  // Security fields
  @Prop({ default: 0 })
  failedLoginAttempts!: number;

  @Prop()
  lockUntil?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Types for methods to satisfy TypeScript
  comparePassword!: (candidatePassword: string) => Promise<boolean>;
  createPasswordResetToken!: () => string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook for hashing password
UserSchema.pre<UserDocument>('save', async function (this: UserDocument) {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (this: UserDocument, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function(this: UserDocument): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

// Indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ userCode: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ organization: 1, rank: 1 });
