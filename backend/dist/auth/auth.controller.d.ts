import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(phone?: string, email?: string, passwordPlain?: string): Promise<{
        [x: string]: any;
        accessToken: string;
    }>;
    sendOtp(phone?: string, email?: string, targetInput?: string, role?: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    verifyOtp(phone?: string, email?: string, targetInput?: string, otp?: string, role?: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(phone?: string, email?: string, targetInput?: string, role?: string): Promise<{
        success: boolean;
    }>;
    resetPassword(phone?: string, email?: string, targetInput?: string, otp?: string, newPasswordPlain?: string, role?: string): Promise<{
        success: boolean;
    }>;
}
