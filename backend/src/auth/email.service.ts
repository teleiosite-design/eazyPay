import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private templateCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  private getTemplate(templateName: string): handlebars.TemplateDelegate {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const possiblePaths = [
      path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'templates', `${templateName}.hbs`),
      path.join(__dirname, '..', 'templates', `${templateName}.hbs`),
      path.join(__dirname, 'templates', `${templateName}.hbs`),
    ];

    let source = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        source = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!source) {
      this.logger.warn(
        `[HBS WARNING] Template ${templateName}.hbs not found. Using fallback layout.`,
      );
      source = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0B0F19; color: #F8FAFC;">
          <h2 style="color: #00F2FE;">⚡ EAZYPAY Verification</h2>
          <p>Hello {{name}},</p>
          <p>Your security OTP code is:</p>
          <h1 style="color: #00F2FE; letter-spacing: 5px;">{{otpCode}}</h1>
        </div>
      `;
    }

    const compiled = handlebars.compile(source);
    this.templateCache.set(templateName, compiled);
    return compiled;
  }

  async sendOtpEmail(
    email: string,
    otpCode: string,
    name: string = 'User',
    isReset: boolean = false,
  ): Promise<boolean> {
    const sender = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
    const templateName = isReset ? 'password-reset' : 'otp';
    const template = this.getTemplate(templateName);

    const htmlContent = template({
      name,
      otpCode,
      subject: isReset
        ? 'Reset Your EazyPay PIN / Password'
        : 'Your EazyPay Verification OTP Code',
      year: new Date().getFullYear(),
    });

    const subject = isReset
      ? `EazyPay Reset Code: ${otpCode}`
      : `Your EazyPay Verification Code: ${otpCode}`;

    this.logger.log(
      `[RESEND HBS EMAIL] Rendering ${templateName}.hbs for ${email}...`,
    );

    if (this.resend) {
      try {
        const data = await this.resend.emails.send({
          from: `EazyPay Security <${sender}>`,
          to: [email],
          subject,
          html: htmlContent,
        });
        this.logger.log(
          `[RESEND SUCCESS] Sent ${templateName}.hbs email to ${email}, id: ${data.data?.id}`,
        );
        return true;
      } catch (error) {
        this.logger.error(
          `[RESEND ERROR] Failed to send email to ${email}:`,
          error,
        );
        return false;
      }
    } else {
      this.logger.warn(`[RESEND SKIPPED] No API key configured.`);
      return true;
    }
  }
}
