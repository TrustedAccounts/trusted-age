import { Controller, Get } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  @Get()
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
