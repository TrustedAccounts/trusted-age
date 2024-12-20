import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

export enum CountryCode {
  DE = 'DE',
  AT = 'AT',
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  ID_CARD = 'ID_CARD',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  ONLINE_BANKING = 'ONLINE_BANKING',
  DIGITAL_GOVERNMENT_ID = 'DIGITAL_GOVERNMENT_ID',
}

@Schema()
export class User {
  @Prop({
    type: Types.UUID,
    required: true,
    unique: true,
    default: v4,
  })
  uuid: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: Number, min: 0, max: 150, required: false })
  age: string;

  @Prop({ type: String, enum: CountryCode, required: false })
  country_code: CountryCode;

  @Prop({ type: String, enum: DocumentType, required: false })
  document_type: DocumentType;

  @Prop({ type: String, required: true })
  hashed_password: string;

  @Prop({ type: Boolean, required: true })
  email_verified: boolean;

  @Prop({ type: Boolean, required: true })
  phone_verified: boolean;

  @Prop({ type: String, required: false })
  phone_country_code: string;

  @Prop({ type: Array, required: false })
  failed_sms: [];

  @Prop({ type: Array, required: false })
  failed_passwords: [];

  @Prop({ type: Boolean, required: false })
  document_verified: boolean;

  @Prop({ type: Boolean, required: false })
  liveness_verified: boolean;

  @Prop({ type: Boolean, required: false })
  age_verified: boolean;

  @Prop({ type: Boolean, required: false })
  verification_complete: boolean;

  @Prop({ type: String, required: false })
  last_liveness_reference_image_url: string;

  @Prop({ type: Boolean, required: false })
  verification_failed: boolean;
}

export enum UserStep {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  COUNTRY_VERIFICATION = 'COUNTRY_VERIFICATION',
  PASSPORT_VERIFICATION = 'PASSPORT_VERIFICATION',
  LIVENESS_VERIFICATION = 'LIVENESS_VERIFICATION',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFICATION_SUCCESS = 'VERIFICATION_SUCCESS',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
}

export const UserSchema = SchemaFactory.createForClass(User);
