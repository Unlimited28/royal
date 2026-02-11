import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryItem, type GalleryItemDocument } from '@schemas/gallery.schema';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryItem.name) private galleryModel: Model<GalleryItemDocument>,
  ) {}

  async create(data: any) {
    const newItem = new this.galleryModel(data);
    return newItem.save();
  }

  async findAll() {
    return this.galleryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const item = await this.galleryModel.findById(id).exec();
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async remove(id: string) {
    const item = await this.galleryModel.findByIdAndDelete(id).exec();
    if (!item) throw new NotFoundException('Gallery item not found');
    return { message: 'Gallery item deleted' };
  }
}
