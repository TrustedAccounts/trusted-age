import { CountryCode, DocumentType } from '../schemas/user.schema';

export class UpdateUserCountryDto {
  country_code?: CountryCode;
  document_type?: DocumentType;
}
