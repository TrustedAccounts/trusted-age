import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigEnum } from '../env.config';
import { UserService } from '../user/user.service';
import * as sharp from 'sharp';
import { User } from '../schemas/user.schema';
import { AdminEmailService } from './admin-email.service';

@Injectable()
export class AdminService {
  private s3Client: S3Client;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private adminEmailService: AdminEmailService,
  ) {
    const config = {
      region: this.configService.get<string>(ConfigEnum.AwsRegion),
      credentials: {
        accessKeyId: this.configService.get<string>(ConfigEnum.AwsAccessKeyId),
        secretAccessKey: this.configService.get<string>(
          ConfigEnum.AwsSecretKey,
        ),
      },
    };
    this.s3Client = new S3Client(config);
  }

  async getPendingUserRequests(): Promise<User[]> {
    return this.userService.findAll({
      $and: [
        { verification_complete: false },
        { verification_failed: { $ne: true } },
      ],
    });
  }

  async approveUserRequest(
    userId: string,
    approved: boolean,
  ): Promise<User | null> {
    const user = await this.userService.finalizeUserVerification(
      userId,
      approved,
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Uncomment if we want to send an email to the user when their request is approved/rejected
    if (approved) {
      await this.adminEmailService.sendApprovalEmail(user);
    } else {
      await this.adminEmailService.sendRejectionEmail(user);
    }

    return user;
  }

  async getUserDocuments(
    userId: string,
  ): Promise<{ passportImage: string; faceImage: string }> {
    const passportImage = await this.getPassportImage(userId);
    const faceImage = await this.getFaceImage(userId);

    return { passportImage, faceImage };
  }

  private async getPassportImage(userId: string): Promise<string> {
    const bucketName = this.configService.get<string>(
      ConfigEnum.DocumentBucket,
    );
    const documentFolder = this.configService.get<string>(
      ConfigEnum.DocumentFolder,
    );

    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${documentFolder}/${userId}-`,
    });

    const listResponse = await this.s3Client.send(listCommand);
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      throw new Error('Passport image not found for user');
    }

    const sortedContents = listResponse.Contents.sort((a, b) => {
      return (
        (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0)
      );
    });

    const passportObjectKey = sortedContents[0].Key;

    if (!passportObjectKey) {
      throw new Error('Passport image key not found');
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: passportObjectKey,
    });

    const getObjectResponse = await this.s3Client.send(getObjectCommand);

    const stream = getObjectResponse.Body as NodeJS.ReadableStream;

    if (!stream) {
      throw new Error('Could not retrieve passport image');
    }

    const buffer = await this.streamToBuffer(stream);
    const compressedBuffer = await this.compressImage(buffer);
    const base64Image = compressedBuffer.toString('base64');

    // Include the data URI prefix
    return `data:image/jpeg;base64,${base64Image}`;
  }

  private async getFaceImage(userId: string): Promise<string> {
    const bucketName = this.configService.get<string>(
      ConfigEnum.DocumentBucket,
    );

    const user = await this.userService.findOne(userId);
    if (!user || !user.last_liveness_reference_image_url) {
      throw new Error('User has no liveness session');
    }

    const faceObjectKey = user.last_liveness_reference_image_url;

    if (!faceObjectKey) {
      throw new Error('Face image key not found');
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: faceObjectKey,
    });

    const getObjectResponse = await this.s3Client.send(getObjectCommand);

    const stream = getObjectResponse.Body as NodeJS.ReadableStream;

    if (!stream) {
      throw new Error('Could not retrieve face image');
    }

    const buffer = await this.streamToBuffer(stream);
    const compressedBuffer = await this.compressImage(buffer);
    const base64Image = compressedBuffer.toString('base64');

    // Include the data URI prefix
    return `data:image/jpeg;base64,${base64Image}`;
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.once('end', () => resolve(Buffer.concat(chunks)));
      stream.once('error', reject);
    });
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    let compressedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();

    let noAttempts = 0;
    while (compressedBuffer.length > 1 * 1024 * 1024 && noAttempts < 5) {
      noAttempts++;
      compressedBuffer = await sharp(compressedBuffer)
        .jpeg({ quality: 60 })
        .toBuffer();
      if (compressedBuffer.length <= 1 * 1024 * 1024) {
        break;
      }
    }

    return compressedBuffer;
  }
}
