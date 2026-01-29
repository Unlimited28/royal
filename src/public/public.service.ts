import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomepageSection } from '../schemas/homepage-section.schema';
import type { HomepageSectionDocument } from '../schemas/homepage-section.schema';
import { CreateHomepageSectionDto, UpdateHomepageSectionDto } from './dto/homepage-section.dto';
import { sanitizeMarkdown } from '../utils/sanitizer';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(HomepageSection.name) private sectionModel: Model<HomepageSectionDocument>,
  ) {}

  async createSection(createDto: CreateHomepageSectionDto) {
    createDto.content = sanitizeMarkdown(createDto.content);
    const existing = await this.sectionModel.findOne({ key: createDto.key });
    if (existing) throw new ConflictException(`Section with key ${createDto.key} already exists`);

    const section = new this.sectionModel(createDto);
    return section.save();
  }

  async findAllSections() {
    return this.sectionModel.find().exec();
  }

  async findActiveSections() {
    return this.sectionModel.find({ isActive: true }).exec();
  }

  async updateSection(id: string, updateDto: UpdateHomepageSectionDto) {
    if (updateDto.content) {
      updateDto.content = sanitizeMarkdown(updateDto.content);
    }
    const section = await this.sectionModel.findById(id);
    if (!section) throw new NotFoundException('Section not found');

    Object.assign(section, updateDto);
    return section.save();
  }

  async removeSection(id: string) {
    const result = await this.sectionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Section not found');
    return result;
  }
}
