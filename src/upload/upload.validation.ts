import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const allowedMimeTypes = ['image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024;

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    if (file.size > maxFileSize) {
      throw new BadRequestException(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)} MB`);
    }

    return file;
  }
}
