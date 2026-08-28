import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { EmailService } from './email.service';
export declare class AuthService {
    private readonly userRepository;
    private readonly merchantRepository;
    private readonly jwtService;
    private readonly emailService;
    constructor(userRepository: Repository<User>, merchantRepository: Repository<Merchant>, jwtService: JwtService, emailService: EmailService);
    validateMerchant(identifier: string, passwordPlain: string): Promise<any>;
    login(user: any): Promise<{
        [x: string]: any;
        accessToken: string;
    }>;
    sendOtp(target: string, role: string, emailAddress?: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    verifyOtp(target: string, otp: string, role: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(target: string, role: string): Promise<{
        success: boolean;
    }>;
    resetPassword(target: string, otp: string, newPasswordPlain: string, role: string): Promise<{
        success: boolean;
    }>;
}
