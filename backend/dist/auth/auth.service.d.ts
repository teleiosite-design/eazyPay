import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly merchantRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, merchantRepository: Repository<Merchant>, jwtService: JwtService);
    validateMerchant(phone: string, passwordPlain: string): Promise<any>;
    login(user: any): Promise<{
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
