import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserCountryDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Req() request: AuthedRequest) {
    return this.userService.findOne(request.user.id);
  }

  @Get('step')
  async getUserStep(@Req() request: AuthedRequest) {
    const step = await this.userService.getUserStep(request.user.id);

    return { step };
  }

  @Get('country-document')
  async getUserCountryDocument(@Req() request: AuthedRequest) {
    const user = await this.userService.findOne(request.user.id);

    return {
      country: user?.country_code || null,
      documentType: user?.document_type || null,
    };
  }

  @Put('country-document')
  async updateUserCountryDocument(
    @Req() request: AuthedRequest,
    @Body() body: UpdateUserCountryDto,
  ) {
    const user = await this.userService.updateCountryDocument(
      request.user.id,
      body,
    );

    return {
      country_code: user?.country_code || null,
      document_type: user?.document_type || null,
    };
  }

  @Post('reset-verification')
  async resetUserVerification(@Req() request: AuthedRequest) {
    const result = await this.userService.resetUserVerification(
      request.user.id,
    );

    return { success: !!result };
  }
}
