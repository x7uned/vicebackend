import { Controller, Post, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { FileValidationPipe } from './upload.validation';

function configureMulter(destination: string, prefix: string) {
  return diskStorage({
    destination: `./uploads/${destination}`,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${prefix}-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  });
}

@Controller('upload')
export class FileUploadController {
  private readonly baseUrl: string = 'http://localhost:4444/uploads';

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: configureMulter('avatars', 'avatar'),
    }),
  )
  @UsePipes(new FileValidationPipe())
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileUrl = `${this.baseUrl}/avatars/${file.filename}`;
    return { message: 'Avatar uploaded successfully!', fileUrl };
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: configureMulter('products', 'product'),
    }),
  )
  @UsePipes(new FileValidationPipe())
  uploadProductPhoto(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileUrl = `${this.baseUrl}/products/${file.filename}`;
    return { message: 'Product photo uploaded successfully!', fileUrl };
  }

  @Post('banner')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: configureMulter('banners', 'banner'),
    }),
  )
  @UsePipes(new FileValidationPipe())
  uploadBanner(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileUrl = `${this.baseUrl}/banners/${file.filename}`;
    return { message: 'Banner uploaded successfully!', fileUrl };
  }
}
