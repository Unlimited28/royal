/// <reference types="multer" />
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFileMetadata {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir(this.uploadRoot);
    this.ensureUploadDir(path.join(this.uploadRoot, 'receipts'));
    this.ensureUploadDir(path.join(this.uploadRoot, 'excel'));
  }

  private ensureUploadDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subDir: 'receipts' | 'excel'): Promise<UploadedFileMetadata> {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(this.uploadRoot, subDir, fileName);

      await fs.promises.writeFile(filePath, file.buffer);

      // In a real app, this URL would be served by an express static middleware or a cloud provider
      // For Phase 2, we store the local path or a relative URL
      const relativePath = `/uploads/${subDir}/${fileName}`;

      return {
        originalname: file.originalname,
        filename: fileName,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url: relativePath,
      };
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('Could not save file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error: any) {
      console.error('File deletion error:', error);
      // We don't necessarily want to throw here if it's just a cleanup
    }
  }
}
