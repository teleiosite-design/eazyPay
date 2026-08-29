"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.resend = null;
        this.templateCache = new Map();
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
    }
    getTemplate(templateName) {
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName);
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
            this.logger.warn(`[HBS WARNING] Template ${templateName}.hbs not found. Using fallback layout.`);
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
    async sendOtpEmail(email, otpCode, name = 'User', isReset = false) {
        const sender = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
        const templateName = isReset ? 'password-reset' : 'otp';
        const template = this.getTemplate(templateName);
        const htmlContent = template({
            name,
            otpCode,
            subject: isReset ? 'Reset Your EazyPay PIN / Password' : 'Your EazyPay Verification OTP Code',
            year: new Date().getFullYear(),
        });
        const subject = isReset ? `EazyPay Reset Code: ${otpCode}` : `Your EazyPay Verification Code: ${otpCode}`;
        this.logger.log(`[RESEND HBS EMAIL] Rendering ${templateName}.hbs for ${email}...`);
        if (this.resend) {
            try {
                const data = await this.resend.emails.send({
                    from: `EazyPay Security <${sender}>`,
                    to: [email],
                    subject,
                    html: htmlContent,
                });
                this.logger.log(`[RESEND SUCCESS] Sent ${templateName}.hbs email to ${email}, id: ${data.data?.id}`);
                return true;
            }
            catch (error) {
                this.logger.error(`[RESEND ERROR] Failed to send email to ${email}:`, error);
                return false;
            }
        }
        else {
            this.logger.warn(`[RESEND SKIPPED] No API key configured.`);
            return true;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map