import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../schemas/user.schema';
import { EmailService } from './email.service';

@Injectable()
export class AdminEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // Notify admin that a user is pending verification
  async notifyAdminOfPendingUser(user: User) {
    const adminEmail = 'accounts@trustedaccounts.org';
    const hostUrl = this.configService.get<string>('HOSTED_ENV_URL');
    const userDetailLink = `${hostUrl}/admin`;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #3E3F70;">
        <h1 style="color: #2E31FF;">New User Pending Verification</h1>
        <p>Dear Admin,</p>
        <p>A new user is pending verification. Here are the details:</p>
        <ul>
          <li><strong>Country:</strong> ${user.country_code}</li>
          <li><strong>Age:</strong> ${user.age}</li>
        </ul>
        <p>You can review their profile and documents <a href="${userDetailLink}" style="color: #2E31FF; text-decoration: none;">here</a>.</p>
        <p>Best regards,<br/>Trusted Accounts Node Server</p>
      </div>
    `;

    try {
      await this.emailService.sendMail(
        adminEmail,
        'User Pending Verification',
        '',
        emailBody,
      );
      console.log('Notification email sent to admin.');
    } catch (error) {
      console.error('Error sending notification email to admin:', error);
    }
  }

  async sendApprovalEmail(user: User) {
    const email = user.email;
    const hostUrl = this.configService.get<string>('HOSTED_ENV_URL');
    const tokenLink = `${hostUrl}`;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #3E3F70;">
        <h1 style="color: #2E31FF;">Your Account Has Been Approved</h1>
        <p>Dear ${user.email || 'User'},</p>
        <p>Congratulations! Your account has been approved.</p>
        <p>You can now access your token by clicking the link below:</p>
        <a href="${tokenLink}" style="color: #2E31FF; text-decoration: none;">Get Your Token</a>
        <p>Best regards,<br/>The Team</p>
      </div>
    `;

    try {
      await this.emailService.sendMail(email, 'Account Approval', '', emailBody);
      console.log('Approval email sent to user.');
    } catch (error) {
      console.error('Error sending approval email to user:', error);
    }
  }

  async sendRejectionEmail(user: User) {
    const email = user.email;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #3E3F70;">
        <h1 style="color: #E52929;">Your Account Verification Failed</h1>
        <p>Dear ${user.email || 'User'},</p>
        <p>We regret to inform you that your account verification has failed.</p>
        <p>Please contact support for more information.</p>
        <p>Best regards,<br/>The Team</p>
      </div>
    `;

    try {
      await this.emailService.sendMail(
        email,
        'Account Verification Failed',
        '',
        emailBody,
      );
      console.log('Rejection email sent to user.');
    } catch (error) {
      console.error('Error sending rejection email to user:', error);
    }
  }
}
