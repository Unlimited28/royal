import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor() {
    this.ensureUploadDirs();
  }

  private ensureUploadDirs() {
    const dirs = ['./uploads/receipts', './uploads/excel'];
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  static getStorageOptions(destination: string) {
    return diskStorage({
      destination: `./uploads/${destination}`,
      filename: (_req, file, callback) => {
        const uniqueSuffix = uuidv4();
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    });
  }

  static fileFilter(allowedTypes: string[]) {
    return (_req: any, file: any, callback: any) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new BadRequestException(`Only ${allowedTypes.join(', ')} are allowed`), false);
      }
      callback(null, true);
    };
  }
}
