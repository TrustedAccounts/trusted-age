import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Document } from '../schemas/document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<Document>,
  ) {}

  async findOneByUserId(userId: string): Promise<Document | null> {
    return this.documentModel
      .findOne({
        userId,
      })
      .exec();
  }

  async findOne(id: string): Promise<Document | null> {
    return this.documentModel.findById(id).exec();
  }

  async create(
    documentNumber: string,
    userId: string,
    session?: ClientSession,
  ): Promise<Document> {
    const document = new this.documentModel({ documentNumber, userId });
    return document.save({ session });
  }

  async findOneByDocumentNumber(
    documentNumber: string,
    session?: ClientSession,
  ): Promise<Document | null> {
    return this.documentModel
      .findOne({ documentNumber })
      .session(session)
      .exec();
  }
}
