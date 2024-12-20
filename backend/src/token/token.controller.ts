import {
  Controller,
  Get,
  Req,
  Res,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Response } from 'express';
import * as jose from 'jose';
import { TokenService } from './token.sevice';

@Controller('auth')
export class TokenController implements OnApplicationBootstrap {
  private jwks;

  constructor(private tokenService: TokenService) {}

  @Get('token')
  async getSecondaryToken(@Req() request: any, @Res() response: Response) {
    const token = await this.tokenService.getSecondaryToken(request.user.id);

    response.cookie('userToken', token, {
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return response.json({ token });
  }

  @Get('.well-known/jwks.json')
  getJWKS() {
    if (!this.jwks) {
      throw new InternalServerErrorException('JWKS not initialized properly.');
    }
    return this.jwks;
  }

  private async initJWKS() {
    const base64PublicKey = process.env.JWT_PUBLIC_KEY;
    const base64PrivateKey = process.env.JWT_PRIVATE_KEY;

    if (!base64PublicKey) {
      throw new InternalServerErrorException(
        'JWT_PUBLIC_KEY is not set in the environment variables.',
      );
    }

    if (!base64PrivateKey) {
      throw new InternalServerErrorException(
        'JWT_PRIVATE_KEY is not set in the environment variables.',
      );
    }

    try {
      // Decode and validate the public key
      const publicKey = Buffer.from(base64PublicKey, 'base64').toString(
        'utf-8',
      );
      const publicKeyValidation = await jose.importSPKI(publicKey, 'RS256');

      // Decode and validate the private key
      const privateKey = Buffer.from(base64PrivateKey, 'base64').toString(
        'utf-8',
      );
      await jose.importPKCS8(privateKey, 'RS256'); // Ensures the private key is valid

      // Export the public key to JWK format
      const jwk = await jose.exportJWK(publicKeyValidation);
      jwk.kid = 'trusted-accounts'; // Assign a unique key ID

      this.jwks = { keys: [jwk] };
      console.log('JWKS successfully initialized.');
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to initialize keys: Ensure both JWT_PUBLIC_KEY and JWT_PRIVATE_KEY are valid base64-encoded RS256 keys. Error: ${error.message}`,
      );
    }
  }

  async onApplicationBootstrap() {
    await this.initJWKS();
  }
}
