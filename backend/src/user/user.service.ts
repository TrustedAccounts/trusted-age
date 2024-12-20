import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserStep } from '../schemas/user.schema';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { UpdateUserCountryDto } from './user.dto';
import { AdminEmailService } from '../admin/admin-email.service';

@Injectable()
export class UserService {
  constructor(
    private adminEmailService: AdminEmailService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateLastLivenessReferenceImage(
    id: string,
    referenceImageUrl: string,
    session?: ClientSession,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { last_liveness_reference_image_url: referenceImageUrl },
        { new: true },
      )
      .session(session)
      .exec();
  }

  async getUserStep(id: string): Promise<UserStep | null> {
    let user = await this.userModel
      .findById(id)
      .exec()
      .catch((e) => {
        return e;
      });

    if (!user) {
      return UserStep.EMAIL_VERIFICATION;
    }

    if (!user.email_verified) {
      return UserStep.EMAIL_VERIFICATION;
    }

    if (!user.phone_verified) {
      return UserStep.PHONE_VERIFICATION;
    }

    if (!user.country_code) {
      return UserStep.COUNTRY_VERIFICATION;
    }

    if (!user.age_verified || !user.document_verified) {
      return UserStep.PASSPORT_VERIFICATION;
    }

    if (!user.liveness_verified) {
      return UserStep.LIVENESS_VERIFICATION;
    }

    if (user.verification_complete && !user.verification_failed) {
      return UserStep.VERIFICATION_SUCCESS;
    }

    if (!user.verification_complete && user.verification_failed) {
      return UserStep.VERIFICATION_FAILED;
    }

    return UserStep.VERIFICATION_PENDING;
  }

  async updateCountryDocument(
    id: string,
    body: UpdateUserCountryDto,
    session?: ClientSession,
  ): Promise<User | null> {
    if (!body.country_code) {
      throw new Error('Please provide a country code');
    }

    if (!body.document_type) {
      throw new Error('Please provide a document type');
    }

    const user = await this.userModel.findById(id).exec();

    await this.userModel
      .findByIdAndUpdate(
        id,
        {
          country_code: body.country_code,
          document_type: body.document_type,
          ...(user.document_type !== body.document_type
            ? { document_verified: false }
            : {}),
        },
        { session },
      )
      .session(session)
      .exec();

    return this.updateUserVerificationSuccess(id, session);
  }

  async updatePassportVerified(
    id: string,
    session?: ClientSession,
  ): Promise<User | null> {
    await this.userModel
      .findByIdAndUpdate(id, { document_verified: true })
      .session(session)
      .exec();

    return this.updateUserVerificationSuccess(id, session);
  }

  async updateLivenessVerified(
    id: string,
    session?: ClientSession,
  ): Promise<User | null> {
    await this.userModel
      .findByIdAndUpdate(id, { liveness_verified: true }, { session })
      .session(session)
      .exec();

    const user = await this.updateUserVerificationSuccess(id, session);

    // Check if user step is now pending and send a notification if so
    if (user) {
      const userStep = await this.getUserStep(id);
      if (userStep === UserStep.VERIFICATION_PENDING) {
        this.adminEmailService.notifyAdminOfPendingUser(user);
      }
    }

    return user;
  }

  async updateUserVerificationSuccess(
    id: string,
    session?: ClientSession,
  ): Promise<User | null> {
    const user = await this.userModel.findById(id).session(session).exec();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async finalizeUserVerification(
    id: string,
    approve: boolean,
  ): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new Error('User not found');
    }

    if (
      user.email_verified &&
      user.phone_verified &&
      user.country_code &&
      user.document_verified &&
      user.liveness_verified
    ) {
      return this.userModel
        .findByIdAndUpdate(id, {
          verification_complete: approve,
          verification_failed: !approve,
        })
        .exec();
    } else {
      throw new Error('User has not submitted all required checks');
    }
  }

  async update(id: string, data: UpdateUserCountryDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateAge(
    id: string,
    age: number,
    session?: ClientSession,
  ): Promise<User | null> {
    await this.userModel
      .findByIdAndUpdate(id, { age, age_verified: true }, { new: true })
      .session(session)
      .exec();

    return this.updateUserVerificationSuccess(id, session);
  }

  async findAll(filter?: FilterQuery<UserDocument>): Promise<User[]> {
    return this.userModel.find(filter).exec();
  }

  async resetUserVerification(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verification_failed) {
      return this.userModel
        .findByIdAndUpdate(id, {
          country_code: null,
          document_verified: false,
          liveness_verified: false,
          verification_complete: false,
          verification_failed: false,
          document_type: null,
          last_liveness_reference_image_url: null,
        })
        .exec();
    } else {
      throw new Error('Your verification is already accepted');
    }
  }
}
