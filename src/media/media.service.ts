import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from '../schemas/media.schema';
import type { MediaDocument } from '../schemas/media.schema';
import type { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}

  async create(mediaData: CreateMediaDto) {
    const newMedia = new this.mediaModel(mediaData);
    return newMedia.save();
  }

  async findAll(activeOnly = false) {
    const filter = activeOnly ? { isActive: true } : {};
    return this.mediaModel.find(filter).exec();
  }

  async findOne(id: string) {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async update(id: string, updateData: UpdateMediaDto) {
    return this.mediaModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string) {
    return this.mediaModel.findByIdAndDelete(id).exec();
  }
}
