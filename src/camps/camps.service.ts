import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Camp } from '../schemas/camp.schema';
import type { CampDocument } from '../schemas/camp.schema';

@Injectable()
export class CampsService {
  constructor(
    @InjectModel(Camp.name) private campModel: Model<CampDocument>,
  ) {}

  async create(campData: any) {
    const newCamp = new this.campModel(campData);
    return newCamp.save();
  }

  async findAll() {
    return this.campModel.find().exec();
  }

  async findActive() {
    return this.campModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    const camp = await this.campModel.findById(id).exec();
    if (!camp) throw new NotFoundException('Camp not found');
    return camp;
  }

  async update(id: string, updateData: any) {
    return this.campModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string) {
    return this.campModel.findByIdAndDelete(id).exec();
  }
}
