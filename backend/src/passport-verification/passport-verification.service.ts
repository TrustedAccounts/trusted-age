import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentAnalysisService } from './document-analysis.service';
import { UserService } from '../user/user.service';
import { DateTime } from 'luxon';
import { DocumentService } from '../document/document.service';
import { ConfigEnum } from '../env.config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CountryCode, DocumentType } from '../schemas/user.schema';
import { DocumentVerificationErrorCodes } from './passport-verification.utils';

@Injectable()
export class PassportVerificationService {
  private verificationS3Client: S3Client;

  constructor(
    private documentAnalysisService: DocumentAnalysisService,
    private userService: UserService,
    private documentService: DocumentService,
    private configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
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
    this.verificationS3Client = new S3Client(config);
  }

  async analyzeDocument(file: Express.Multer.File, userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const documentType = user.document_type;

    switch (documentType) {
      case DocumentType.PASSPORT:
        return this.analyzePassport(file, userId);
      case DocumentType.DRIVERS_LICENSE:
        return this.analyzeDriversLicense(file, userId, user.country_code);
      case DocumentType.ID_CARD:
        return this.analyzeIdCard(file, userId, user.country_code);
      default:
        throw new Error('Document type not supported.');
    }
  }

  async analyzeIdCard(
    file: Express.Multer.File,
    userId: string,
    countryCode: CountryCode | null,
  ) {
    const { dob, documentNumber } = await this.getDocumentContent(
      file,
      DocumentType.ID_CARD,
    );
    const age = this.calculateAge(dob);

    try {
      this.validateAge(age);
      this.validateDocumentNumber(documentNumber);
    } catch (error) {
      console.error('Error analyzing ID card', error);
      throw new Error(
        'Failed to analyze ID card. Please try again or contact support.',
      );
    }

    await this.storeDocument(file, {
      userId,
      age,
      documentNumber,
    });
  }

  async storeDocument(
    file: Express.Multer.File,
    {
      userId,
      age,
      documentNumber,
    }: { userId: string; age: number; documentNumber: string },
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.storePassport(file, userId);
      await this.userService.updateAge(userId, age, session);
      await this.userService.updatePassportVerified(userId, session);
      const document = await this.documentService.findOneByDocumentNumber(
        documentNumber,
        session,
      );

      if (!document) {
        await this.documentService.create(documentNumber, userId, session);
      } else if (document?.userId !== userId) {
        throw new Error(
          `${DocumentVerificationErrorCodes.DOCUMENT_ALREADY_EXISTS}: Document number already in use.`,
        );
      }

      await session.commitTransaction();
    } catch (error) {
      console.error('Error analyzing document', error);
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async analyzeDriversLicense(
    file: Express.Multer.File,
    userId: string,
    countryCode: CountryCode | null,
  ) {
    const { dob, licenseNumber } = await this.getDriverLicenseContent(file);
    const age = this.calculateAge(dob);

    try {
      this.validateAge(age);
      this.validateLicenseNumber(licenseNumber, countryCode);
    } catch (error) {
      console.error('Error analyzing driver’s license', error);
      throw new Error(
        'Failed to analyze driver’s license. Please try again or contact support.',
      );
    }

    await this.storeDocument(file, {
      userId,
      age,
      documentNumber: licenseNumber,
    });
  }

  async getDriverLicenseContent(file: Express.Multer.File) {
    const content =
      await this.documentAnalysisService.getDriversLicenseDocumentContent(file);
    return {
      dob: content?.dateOfBirth,
      licenseNumber: content?.licenseNumber,
    };
  }

  async storePassport(file: Express.Multer.File, userId: string) {
    const filename = `${userId}-${Date.now()}`;
    const config = {
      Bucket: this.configService.get<string>(ConfigEnum.DocumentBucket),
      Key: `${this.configService.get<string>(
        ConfigEnum.DocumentFolder,
      )}/${filename}`,
      Body: file.buffer,
    };

    try {
      await this.verificationS3Client.send(new PutObjectCommand(config));
    } catch (error) {
      console.error('Error storing passport', error);
      throw new Error(
        'Failed to store passport. Please try again or contact support',
      );
    }
  }

  async getDocumentContent(
    file: Express.Multer.File,
    type: DocumentType.PASSPORT | DocumentType.ID_CARD,
  ) {
    if (process.env.TEST_MODE == 'true') {
      // Intentional .env hack
      return {
        dob: new Date('1997-07-25T07:31:18.528Z'),
        documentNumber: '12345678',
      };
    } else {
      const content = await this.documentAnalysisService.getDocumentContent(
        file,
        type,
      );
      return {
        dob: content?.foundFieldsAttempt.dateOfBirth,
        documentNumber: content?.foundFieldsAttempt.documentNo,
      };
    }
  }

  async analyzePassport(file: Express.Multer.File, userId: string) {
    const { dob, documentNumber } = await this.getDocumentContent(
      file,
      DocumentType.PASSPORT,
    );
    const age = this.calculateAge(dob);

    try {
      this.validateAge(age);
      this.validateDocumentNumber(documentNumber);
    } catch (error) {
      console.error('Error analyzing passport', error);
      throw new Error(
        'Failed to analyze passport. Please try again or contact support.',
      );
    }

    await this.storeDocument(file, {
      userId,
      age,
      documentNumber,
    });
  }

  calculateAge(birthDate?: Date): number | null {
    try {
      if (!birthDate) {
        return null;
      }
      const birth = DateTime.fromJSDate(birthDate);
      const now = DateTime.now();
      const age = now.diff(birth, 'years').years;

      return Math.floor(age);
    } catch (error) {
      console.error('Error calculating age', error);
      return null;
    }
  }

  validateAge(age: number): void {
    if (!age || age > 130 || age < 6) {
      throw new Error('Failed to capture age.');
    }
  }

  validateDocumentNumber(documentNumber: string): void {
    if (!documentNumber) {
      throw new Error('Failed to capture document number.');
    }

    // German and austrian document numbers are between 8 and 9 characters
    if (documentNumber.length < 8 || documentNumber.length > 9) {
      throw new Error('Document number is not between 8 and 9 characters.');
    }
  }

  validateLicenseNumber(licenseNumber: string, country: CountryCode): void {
    if (!licenseNumber) {
      throw new Error('Failed to capture license number.');
    }

    if (
      !licenseNumber ||
      (licenseNumber.length !== 11 && country === CountryCode.DE) ||
      (licenseNumber.length !== 8 && country === CountryCode.AT)
    ) {
      throw new Error('Invalid license number.');
    }
  }
}
