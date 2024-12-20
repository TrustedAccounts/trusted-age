import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jose from 'jose';

@Injectable()
export class TokenService {
  private privateKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    // Decode the base64 private key from the environment
    const base64Key = process.env.JWT_PRIVATE_KEY;
    if (!base64Key) {
      throw new Error(
        'JWT_PRIVATE_KEY is not set in the environment variables',
      );
    }
    this.privateKey = Buffer.from(base64Key, 'base64').toString('utf-8');
  }

  async getSecondaryToken(userId: string): Promise<string> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userModel.findById(userId).exec();

    if (!user || !user.verification_complete || user.verification_failed) {
      throw new UnauthorizedException('User is not verified');
    }

    // Hash the user ID
    const hashedUserId = crypto
      .createHash('sha256')
      .update(userId)
      .digest('hex');

    // Generate the token using RS256
    const privateKey = await jose.importPKCS8(this.privateKey, 'RS256');
    const jwt = await new jose.SignJWT({ userId: hashedUserId, isOver18: true })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(this.configService.get<string>('HOSTED_ENV_URL'))
      .sign(privateKey);

    return jwt;
  }
}
