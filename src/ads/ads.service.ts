import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CorporateAd } from '../schemas/corporate-ad.schema';
import type { CorporateAdDocument } from '../schemas/corporate-ad.schema';
import type { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(CorporateAd.name) private adModel: Model<CorporateAdDocument>,
  ) {}

  async create(adData: CreateAdDto) {
    const newAd = new this.adModel(adData);
    return newAd.save();
  }

  async findAll() {
    return this.adModel.find().exec();
  }

  async findActive() {
    const now = new Date();
    return this.adModel.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now }
    }).exec();
  }

  async findOne(id: string) {
    const ad = await this.adModel.findById(id).exec();
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async update(id: string, updateData: UpdateAdDto) {
    return this.adModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string) {
    return this.adModel.findByIdAndDelete(id).exec();
  }
}
