import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { PassportVerificationService } from './passport-verification.service';

@Controller('passport-verification')
export class PassportVerificationController {
  constructor(
    private passportVerificationService: PassportVerificationService,
  ) {}

  @Post('analyze-passport')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Check the file size (20 MB)
    if (file.size > 20971520) {
      throw new BadRequestException('File is too large.');
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG and WebP are allowed.',
      );
    }

    try {
      const status = await this.passportVerificationService.analyzeDocument(
        file,
        req.user.id,
      );
      return { status };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
