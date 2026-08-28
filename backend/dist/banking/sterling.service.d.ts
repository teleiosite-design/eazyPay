import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
export interface SterlingVirtualAccount {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    currency: string;
}
export declare class SterlingService {
    private readonly userRepository;
    private readonly merchantRepository;
    private readonly transactionRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, merchantRepository: Repository<Merchant>, transactionRepository: Repository<Transaction>);
    verifyKycWithSterling(bvnOrNin: string, type?: 'bvn' | 'nin', fullName?: string): Promise<{
        valid: boolean;
        message: string;
        verifiedName: string;
        kycTier: string;
    }>;
    generateVirtualAccount(phone: string, name: string, bvn?: string): Promise<SterlingVirtualAccount>;
    performNameEnquiry(accountNumber: string, bankCode: string): Promise<{
        accountNumber: string;
        accountName: string;
        bankName: string;
        bankCode: string;
    }>;
    initiateNipTransfer(accountNumber: string, bankCode: string, amount: number, narration: string): Promise<{
        success: boolean;
        reference: string;
        message: string;
    }>;
    processWebhook(payload: any, signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
