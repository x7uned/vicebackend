import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
    });
  }
}
