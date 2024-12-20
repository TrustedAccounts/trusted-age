import { Controller, Get, Param, Req } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('/my')
  async getMyDocument(@Req() request: Request) {
    return this.documentService.findOneByUserId('673b77b46049df9130d852b5');
  }

  @Get(':id')
  async getDocument(@Param('id') id: string, @Req() request: Request) {
    return this.documentService.findOne(id);
  }
}
