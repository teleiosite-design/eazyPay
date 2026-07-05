import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
export declare class MerchantsService {
    private readonly merchantRepository;
    constructor(merchantRepository: Repository<Merchant>);
    register(name: string, phone: string, passwordPlain: string, initialBalance?: number): Promise<Merchant>;
    findOne(id: string): Promise<Merchant>;
    findByPhone(phone: string): Promise<Merchant>;
    setTransactionPin(phone: string, pin: string): Promise<{
        success: boolean;
    }>;
    verifyTransactionPin(phone: string, pin: string): Promise<{
        isMatch: boolean;
    }>;
}
