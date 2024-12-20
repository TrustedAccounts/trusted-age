import { Injectable } from '@nestjs/common';
import {
  AnalyzeDocumentCommand,
  FeatureType,
  TextractClient,
} from '@aws-sdk/client-textract';
import { ConfigEnum } from '../env.config';
import { ConfigService } from '@nestjs/config';
import { parseDate } from './string-verification-utils';
import { DocumentType } from '../schemas/user.schema';

@Injectable()
export class DocumentAnalysisService {
  private textractClient: TextractClient;
  private confidenceThreshold = 80; // Confidence threshold for filtering

  constructor(private configService: ConfigService) {
    this.textractClient = new TextractClient({
      region: this.configService.get<string>(ConfigEnum.AwsRegion),
      credentials: {
        accessKeyId: this.configService.get<string>(ConfigEnum.AwsAccessKeyId),
        secretAccessKey: this.configService.get<string>(
          ConfigEnum.AwsSecretKey,
        ),
      },
    });
  }

  async getDocumentContent(
    file: Express.Multer.File,
    documentType: DocumentType.ID_CARD | DocumentType.PASSPORT,
  ) {
    if (file.buffer.length < 100) {
      throw new Error('Invalid file. Please try again.');
    }

    let documentNumberFieldNames: string[] = [];

    switch (documentType) {
      case DocumentType.PASSPORT:
        documentNumberFieldNames = [
          'passportnumber',
          'passportnr',
          'passportno',
          'passno',
          'passnr',
          'passnrpassportnopasseportno',
        ];
        break;
      case DocumentType.ID_CARD:
        documentNumberFieldNames = [
          'dokumentnummer',
          'documentnumber',
          'nummer',
          'nummernumbernumro',
          'nrnon',
        ];
        break;
      default:
        break;
    }

    const params = {
      Document: {
        Bytes: file.buffer,
      },
      FeatureTypes: [FeatureType.FORMS],
    };

    const command = new AnalyzeDocumentCommand(params);
    const textractResponse = await this.textractClient.send(command);

    const foundFieldsAttempt = {
      dateOfBirth: null as Date | null,
      documentNo: null as string | null,
    };

    const keyValueMap = new Map<string, string>();
    const blockMap = new Map<string, any>();

    // Populate the block map and key-value map from the response blocks
    textractResponse.Blocks?.forEach((block) => {
      blockMap.set(block.Id, block);

      if (
        block.BlockType === 'KEY_VALUE_SET' &&
        block.EntityTypes?.includes('KEY')
      ) {
        const keyBlock = block;
        const valueBlock = textractResponse.Blocks?.find(
          (b) => b.Id === keyBlock.Relationships?.[0]?.Ids?.[0],
        );

        if (keyBlock && valueBlock) {
          const key = this.getTextForKey(keyBlock, blockMap);
          const value = this.getTextForValue(valueBlock, blockMap);
          if (key && value) {
            keyValueMap.set(key.toLowerCase(), value);
          }
        }
      }
    });

    // Map extracted fields to the foundFieldsAttempt object
    keyValueMap.forEach((value, key) => {
      const onlyAlphaCharactersKey = key
        .replace(/[^a-zA-Z]/g, '')
        .toLowerCase();
      if (
        this.includesOneOf(onlyAlphaCharactersKey, [
          'birth',
          'dob',
          'geburtsdatum',
          'geburtstag',
          'geburtstagdateofbirthdatedenaissance',
        ]) &&
        !foundFieldsAttempt.dateOfBirth
      ) {
        const unsafeValue = value;
        const date = parseDate(unsafeValue);

        foundFieldsAttempt.dateOfBirth = date;
      }
      if (
        this.includesOneOf(onlyAlphaCharactersKey, documentNumberFieldNames) &&
        !foundFieldsAttempt.documentNo
      ) {
        foundFieldsAttempt.documentNo = value;
      }
    });

    return {
      textractResponse,
      fields: Array.from(keyValueMap.entries()).map(([key, value]) => ({
        key,
        value,
      })),
      foundFieldsAttempt,
    };
  }

  async getDriversLicenseDocumentContent(file: Express.Multer.File) {
    if (file.buffer.length < 100) {
      throw new Error('Invalid file. Please try again.');
    }

    const params = {
      Document: {
        Bytes: file.buffer,
      },
      FeatureTypes: [FeatureType.FORMS],
    };

    const command = new AnalyzeDocumentCommand(params);
    const textractResponse = await this.textractClient.send(command);

    const extractedData = {
      name: null as string | null,
      surname: null as string | null,
      dateOfBirth: null as Date | null,
      placeOfBirth: null as string | null,
      issueDate: null as Date | null,
      expiryDate: null as Date | null,
      licenseNumber: null as string | null,
      categories: null as string | null,
    };

    const rawText = textractResponse.Blocks?.filter(
      (block) => block.BlockType === 'LINE',
    )
      .map((block) => block.Text)
      .join('\n');

    if (rawText) {
      const lines = rawText.split('\n');

      for (const line of lines) {
        if (line.startsWith('1.')) {
          extractedData.surname = line.replace('1.', '').trim();
        } else if (line.startsWith('2.')) {
          extractedData.name = line.replace('2.', '').trim();
        } else if (line.startsWith('3.')) {
          const dobMatch = line.match(/\d{2}\.\d{2}\.\d{4}/);
          if (dobMatch) {
            extractedData.dateOfBirth = parseDate(dobMatch[0]);
          }
          extractedData.placeOfBirth = line
            .split(dobMatch?.[0] || '')[1]
            ?.trim();
        } else if (line.startsWith('4a.')) {
          const issueDateMatch = line.match(/\d{2}\.\d{2}\.\d{4}/);
          if (issueDateMatch) {
            extractedData.issueDate = parseDate(issueDateMatch[0]);
          }
        } else if (line.startsWith('4b.')) {
          const expiryDateMatch = line.match(/\d{2}\.\d{2}\.\d{4}/);
          if (expiryDateMatch) {
            const parsedDate = parseDate(expiryDateMatch[0], true);
            extractedData.expiryDate = parsedDate;
          }
        } else if (line.startsWith('5.')) {
          extractedData.licenseNumber = line.replace('5.', '').trim();
        } else if (line.startsWith('9.')) {
          extractedData.categories = line.replace('9.', '').trim();
        }
      }
    }

    return extractedData;
  }

  private getTextForKey(
    keyBlock: any,
    blockMap: Map<string, any>,
  ): string | null {
    if (keyBlock.Confidence < this.confidenceThreshold) {
      return null; // Skip keys with low confidence
    }

    if (keyBlock.Relationships) {
      for (const relationship of keyBlock.Relationships) {
        if (relationship.Type === 'CHILD') {
          return relationship.Ids.map((id) => {
            const childBlock = blockMap.get(id);
            return childBlock?.Text?.trim();
          })
            .filter((text) => text !== null)
            .join(' ');
        }
      }
    }
    return null;
  }

  private getTextForValue(
    valueBlock: any,
    blockMap: Map<string, any>,
  ): string | null {
    if (valueBlock.Confidence < this.confidenceThreshold) {
      return null; // Skip values with low confidence
    }

    if (valueBlock.Relationships) {
      for (const relationship of valueBlock.Relationships) {
        if (relationship.Type === 'CHILD') {
          const lowConfidenceChildren = relationship.Ids.filter((id) => {
            const childBlock = blockMap.get(id);
            return childBlock?.Confidence < this.confidenceThreshold;
          });

          if (lowConfidenceChildren.length > 0) {
            return null; // Skip values with low confidence children
          } else {
            return relationship.Ids.map((id) => {
              const childBlock = blockMap.get(id);
              return childBlock?.Text?.trim();
            })
              .filter((text) => text !== null)
              .join(' ');
          }
        }
      }
    }
    return valueBlock.Text || null;
  }

  includesOneOf(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.toLowerCase().includes(keyword));
  }
}
