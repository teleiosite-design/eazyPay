import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(phone: string, passwordPlain: string): Promise<{
        [x: string]: any;
        accessToken: string;
    }>;
    sendOtp(phone: string, role: string): Promise<{
        success: boolean;
        otpCode: string;
    }>;
    verifyOtp(phone: string, otp: string, role: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(phone: string, role: string): Promise<{
        success: boolean;
        otpCode: string;
    }>;
    resetPassword(phone: string, otp: string, newPasswordPlain: string, role: string): Promise<{
        success: boolean;
    }>;
}
