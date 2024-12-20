import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '../env.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(ConfigEnum.EmailHost),
      port: parseInt(this.configService.get<string>(ConfigEnum.EmailPort)),
      secure: this.configService.get<boolean>(ConfigEnum.EmailSecure),
      requireTLS: this.configService.get<boolean>(ConfigEnum.EmailRequireTLS),
      auth: {
        user: this.configService.get<string>(ConfigEnum.EmailUser),
        pass: this.configService.get<string>(ConfigEnum.EmailPass),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: this.configService.get<string>(ConfigEnum.EmailUser),
      to,
      subject,
      text,
      html,
    };

    try {
      console.log('Sending email:', mailOptions);
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
