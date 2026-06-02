import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageService {
  private readonly storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath =
      this.configService.get<string>('storage.localPath') || './uploads';
  }

  async upload(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      const userDirPath = path.join(this.storagePath, userId);
      await fs.mkdir(userDirPath, { recursive: true });

      const fileName = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(userDirPath, fileName);

      await fs.writeFile(filePath, file.buffer);

      return path.join(userId, fileName);
    } catch (_e) {
      throw new InternalServerErrorException('Failed to upload receipt');
    }
  }

  async download(subPath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.storagePath, subPath);
      return await fs.readFile(fullPath);
    } catch (_e) {
      throw new NotFoundException('Receipt file not found');
    }
  }

  async delete(subPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.storagePath, subPath);
      await fs.unlink(fullPath);
    } catch (_e) {
      // Ignore if file doesn't exist
    }
  }
}
