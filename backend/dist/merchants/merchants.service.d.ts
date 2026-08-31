import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
export declare class MerchantsService {
    private readonly merchantRepository;
    constructor(merchantRepository: Repository<Merchant>);
    register(name: string, phone: string, passwordPlain: string, initialBalance?: number, email?: string, cacNumber?: string, idType?: string, idNumber?: string, nin?: string, bvn?: string, bankName?: string, accountNumber?: string): Promise<Merchant>;
    verifyKyc(idType: string, idNumber: string, cacNumber?: string, _accountNumber?: string): Promise<{
        valid: boolean;
        message: string;
        kycTier: string;
    }>;
    findOne(id: string): Promise<Merchant>;
    findByPhone(phone: string): Promise<Merchant>;
    setTransactionPin(phone: string, pin: string): Promise<{
        success: boolean;
    }>;
    verifyTransactionPin(phone: string, pin: string): Promise<{
        isMatch: boolean;
    }>;
}
