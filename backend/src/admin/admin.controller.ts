import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  getProtectedPage() {
    return this.adminService.getPendingUserRequests();
  }

  @Get('users/:userId/docs')
  async getUserDocs(@Param('userId') userId: string) {
    return this.adminService.getUserDocuments(userId);
  }

  @Post('users/:userId/approve')
  async approveUserRequest(@Param('userId') userId: string) {
    return this.adminService.approveUserRequest(userId, true);
  }

  @Post('users/:userId/reject')
  async rejectUserRequest(@Param('userId') userId: string) {
    return this.adminService.approveUserRequest(userId, false);
  }
}
