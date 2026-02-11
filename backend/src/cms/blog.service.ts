import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, type BlogDocument } from '@schemas/blog.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(data: any, userId: string, userRole: string) {
    const newBlog = new this.blogModel({
      ...data,
      authorId: new Types.ObjectId(userId),
    });
    const result = await newBlog.save();

    await this.auditLogService.recordAction({
      action: 'BLOG_CREATE',
      actorId: userId,
      actorRole: userRole,
      targetType: 'Blog',
      targetId: result._id as any,
      metadata: { title: result.title },
    });

    return result;
  }

  async findAll(status?: string) {
    const filter = status ? { status } : {};
    return this.blogModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(idOrSlug: string) {
    const filter = Types.ObjectId.isValid(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug };
    const blog = await this.blogModel.findOne(filter).exec();
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async update(id: string, data: any, adminId: string, adminRole: string) {
    const blog = await this.blogModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!blog) throw new NotFoundException('Blog post not found');

    await this.auditLogService.recordAction({
      action: 'BLOG_UPDATE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Blog',
      targetId: id,
      metadata: { title: blog.title },
    });

    return blog;
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog post not found');

    await this.blogModel.findByIdAndDelete(id).exec();

    await this.auditLogService.recordAction({
      action: 'BLOG_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Blog',
      targetId: id,
      metadata: { title: blog.title },
    });

    return { message: 'Blog post deleted' };
  }
}
