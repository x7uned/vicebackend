import { Module } from '@nestjs/common';
import { FileUploadController } from './upload.controller';

@Module({
  controllers: [FileUploadController],
})
export class UploadModule {}
