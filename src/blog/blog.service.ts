import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../schemas/blog.schema';
import type { BlogDocument } from '../schemas/blog.schema';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { sanitizeMarkdown } from '../utils/sanitizer';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async create(createBlogDto: CreateBlogDto, authorId: string, coverImageUrl?: string): Promise<BlogDocument> {
    createBlogDto.content = sanitizeMarkdown(createBlogDto.content);

    const slug = createBlogDto.slug
      ? this.slugify(createBlogDto.slug)
      : this.slugify(createBlogDto.title);

    const existing = await this.blogModel.findOne({ slug });
    if (existing) {
      if (createBlogDto.slug) {
        throw new ConflictException('Slug already exists');
      }
      return this.create({ ...createBlogDto, slug: `${slug}-${Date.now()}` }, authorId, coverImageUrl);
    }

    const blog = new this.blogModel({
      ...createBlogDto,
      slug,
      authorId: new Types.ObjectId(authorId),
      coverImageUrl,
      publishedAt: createBlogDto.status === 'published' ? new Date() : undefined,
    });

    return blog.save();
  }

  async findAll(query: { status?: string; page?: number; limit?: number; search?: string }) {
    const { status, page = 1, limit = 10, search } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.blogModel.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 } as any)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'firstName lastName')
        .exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string) {
    const blog = await this.blogModel.findOne({ slug })
      .populate('authorId', 'firstName lastName')
      .exec();
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, coverImageUrl?: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    if (updateBlogDto.content) {
      updateBlogDto.content = sanitizeMarkdown(updateBlogDto.content);
    }

    if (updateBlogDto.slug) {
      updateBlogDto.slug = this.slugify(updateBlogDto.slug);
      const existing = await this.blogModel.findOne({ slug: updateBlogDto.slug, _id: { $ne: id } });
      if (existing) throw new ConflictException('Slug already exists');
    }

    if (updateBlogDto.status === 'published' && blog.status !== 'published') {
      blog.publishedAt = new Date();
    }

    Object.assign(blog, updateBlogDto);
    if (coverImageUrl) blog.coverImageUrl = coverImageUrl;

    return blog.save();
  }

  async remove(id: string, adminId: string, adminRole: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    const result = await this.blogModel.findByIdAndDelete(id);

    await this.auditLogService.recordAction({
      action: 'BLOG_DELETE',
      actorId: adminId,
      actorRole: adminRole,
      targetType: 'Blog',
      targetId: id,
      metadata: { title: blog.title },
    });

    return result;
  }
}
