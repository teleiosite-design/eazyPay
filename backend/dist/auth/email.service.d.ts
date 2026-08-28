export declare class EmailService {
    private readonly logger;
    private resend;
    private templateCache;
    constructor();
    private getTemplate;
    sendOtpEmail(email: string, otpCode: string, name?: string, isReset?: boolean): Promise<boolean>;
}
