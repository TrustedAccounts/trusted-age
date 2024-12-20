export interface UserResponse {
  _id: string;
  uuid: string;
  email: string;
  age: string;
  country_code?: CountryCode;
  document_type?: DocumentType;
  hashed_password: string;
  email_verified: boolean;
  phone_verified: boolean;
  phone_country_code?: string;
  failed_sms?: string[];
  failed_passwords?: string[];
}

export interface UserStepResponse {
  step: UserStep | null;
}

export interface UserCountryResponse {
  country: CountryCode | null;
  documentType: DocumentType | null;
}

export enum CountryCode {
  DE = "DE",
  AT = "AT",
}

export enum DocumentType {
  PASSPORT = "PASSPORT",
  ID_CARD = "ID_CARD",
  DRIVERS_LICENSE = "DRIVERS_LICENSE",
  ONLINE_BANKING = "ONLINE_BANKING",
  DIGITAL_GOVERNMENT_ID = "DIGITAL_GOVERNMENT_ID",
}

export enum UserStep {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  COUNTRY_VERIFICATION = "COUNTRY_VERIFICATION",
  PASSPORT_VERIFICATION = "PASSPORT_VERIFICATION",
  LIVENESS_VERIFICATION = "LIVENESS_VERIFICATION",
  VERIFICATION_PENDING = "VERIFICATION_PENDING",
  VERIFICATION_SUCCESS = "VERIFICATION_SUCCESS",
  VERIFICATION_FAILED = "VERIFICATION_FAILED",
}

export enum AdminRoutes {
  ADMIN = "/admin",
}
