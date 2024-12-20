import { Module } from '@nestjs/common';
import { PassportVerificationController } from './passport-verification.controller';
import { PassportVerificationService } from './passport-verification.service';
import { DocumentAnalysisService } from './document-analysis.service';
import { UserModule } from '../user/user.module';
import { DocumentModule } from '../document/document.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, DocumentModule, ConfigModule],
  controllers: [PassportVerificationController],
  providers: [PassportVerificationService, DocumentAnalysisService],
})
export class PassportVerificationModule {}
