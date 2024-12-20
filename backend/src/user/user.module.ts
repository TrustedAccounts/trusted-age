import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminEmailService } from '../admin/admin-email.service';
import { EmailService } from '../admin/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: {
        // Do not set expiresIn to have tokens that never expire
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService, EmailService, AdminEmailService],
  exports: [UserService],
})
export class UserModule {}
