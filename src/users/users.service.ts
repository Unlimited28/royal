import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import type { UserDocument } from '../schemas/user.schema';
import { Counter } from '../schemas/counter.schema';
import type { CounterDocument } from '../schemas/counter.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async generateUserCode(): Promise<string> {
    const key = 'global_user_id';
    const counter = await this.counterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const idStr = counter.seq.toString().padStart(4, '0');
    return `RA/OGBC/${idStr}`;
  }

  async create(userData: any): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (!userData.userCode) {
      userData.userCode = await this.generateUserCode();
    }

    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('association').exec();
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAll() {
    return this.userModel.find().populate('association').exec();
  }
}
