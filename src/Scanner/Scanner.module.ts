import { Module } from '@nestjs/common';
import { GroqService } from './Scanner.service';
import { ScannerController } from './Scanner.controller';

@Module({
  providers: [GroqService],
  controllers: [ScannerController],
})
export class GroqModule {}