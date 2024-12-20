import { Module } from '@nestjs/common';
import { LivenessCheckController } from './liveness-check.controller';
import { RekognitionService } from './rekognition.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, UserModule],
  controllers: [LivenessCheckController],
  providers: [RekognitionService],
})
export class LivenessCheckModule {}
