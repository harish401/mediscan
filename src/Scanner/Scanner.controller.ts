import {
    Controller,
    Get,
    Query,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Body,
  } from '@nestjs/common';
  import { GroqService } from './Scanner.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';

  
  @Controller('groq')
  export class ScannerController {
    constructor(private readonly groqService: GroqService) {}

    @Post('image-recognition')
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage({
          destination: './uploads', // Temporary storage location
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + '-' + file.originalname);
          },
        }),
      }),
    )
    async handleImageRecognition(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      return this.groqService.processImage(file.path); // Pass the image path to the service
    }
  }