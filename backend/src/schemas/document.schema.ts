import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 } from 'uuid';

export type DocumentDocument = HydratedDocument<Document>;

@Schema()
export class Document {
  @Prop({
    type: Types.UUID,
    required: true,
    unique: true,
    default: v4,
  })
  uuid: string;

  @Prop({ type: String, required: true })
  documentNumber: string;

  @Prop({ type: String, required: true })
  userId: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document).index(
  { documentNumber: 1, userId: 1 },
  { unique: true },
);
