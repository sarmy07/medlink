import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'images/jpeg',
    'images/jpg',
    'images/png',
    'image/webp',
  ];
  private readonly maxSizeBytes = 2 * 1024 * 1024; //2mb

  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required');

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, JPG, WEBP are allowed');
    }

    if (file.size > this.maxSizeBytes) {
      throw new BadRequestException('Image must be less than 2MB');
    }

    return file;
  }
}
