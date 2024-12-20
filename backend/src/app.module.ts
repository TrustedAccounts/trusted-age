import { Module } from '@nestjs/common';
import { HealthCheckModule } from './health/health-check.module';
import { PassportVerificationModule } from './passport-verification/passport-verification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { LivenessCheckModule } from './liveness-check/liveness-check.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { AdminModule } from './admin/admin.module';
import { TokenModule } from './token/token.module';
import { TokenService } from './token/token.sevice';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    HealthCheckModule,
    LivenessCheckModule,
    PassportVerificationModule,
    UserModule,
    DocumentModule,
    AdminModule,
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
