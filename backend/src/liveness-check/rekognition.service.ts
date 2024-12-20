import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  CreateFaceLivenessSessionCommandInput,
  GetFaceLivenessSessionResultsCommand,
} from '@aws-sdk/client-rekognition';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '../env.config';
import { uuid } from 'uuidv4';
import { UserService } from '../user/user.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class RekognitionService {
  private client: RekognitionClient;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    const cfg = {
      region: this.configService.get<string>(ConfigEnum.AwsRegion),
      credentials: {
        accessKeyId: this.configService.get<string>(ConfigEnum.AwsAccessKeyId),
        secretAccessKey: this.configService.get<string>(
          ConfigEnum.AwsSecretKey,
        ),
      },
    };
    this.client = new RekognitionClient(cfg);
  }

  async startFaceLivenessSession(userId: string): Promise<any> {
    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const sessionToken = uuid();
    const input: CreateFaceLivenessSessionCommandInput = {
      Settings: {
        OutputConfig: {
          S3Bucket: this.configService.get<string>(ConfigEnum.DocumentBucket),
          S3KeyPrefix: ConfigEnum.RekognitionFolder + `/${sessionToken}`,
        },
        AuditImagesLimit: 4,
      },
      ClientRequestToken: sessionToken,
    };
    const command = new CreateFaceLivenessSessionCommand(input);
    const session = await this.client.send(command);

    return session;
  }

  async getFaceLivenessSessionResults(sessionId: string, userId: string) {
    const input = {
      SessionId: sessionId,
    };
    const command = new GetFaceLivenessSessionResultsCommand(input);
    const response = await this.client.send(command);

    const success = response.Status === 'SUCCEEDED' && response.Confidence > 80;
    if (!success) {
      return false;
    }

    // const session = await this.connection.startSession();
    // session.startTransaction();

    try {
      if (!response.ReferenceImage.S3Object.Name) {
        throw new Error('No reference image found');
      }
      await this.userService.updateLastLivenessReferenceImage(
        userId,
        response.ReferenceImage.S3Object.Name,
        // session,
      );
      await this.userService.updateLivenessVerified(userId);
      // await session.commitTransaction();
    } catch (error) {
      // await session.abortTransaction();
      throw error;
    } finally {
      // await session.endSession();
    }

    return true;
  }
}
