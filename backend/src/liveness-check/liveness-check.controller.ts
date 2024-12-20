import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { RekognitionService } from './rekognition.service';

@Controller('liveness-check')
export class LivenessCheckController {
  constructor(private rekognitionService: RekognitionService) {}

  @Post()
  async createLivenessSession(@Req() req: AuthedRequest) {
    const resp = await this.rekognitionService.startFaceLivenessSession(
      req.user.id,
    );
    return {
      status: 'ok',
      sessionId: resp.SessionId,
    };
  }

  @Get()
  async getSessionResults(
    @Req() req: AuthedRequest,
    @Query('sessionId') sessionId: string,
  ) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const isLive = await this.rekognitionService.getFaceLivenessSessionResults(
      sessionId,
      req.user.id,
    );

    return {
      status: 'ok',
      isLive,
    };
  }
}
