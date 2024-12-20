import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AdminEmailService } from './admin-email.service';
import { EmailService } from './email.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminEmailService, EmailService, ConfigService],
  imports: [UserModule],
  exports: [],
})
export class AdminModule {}
