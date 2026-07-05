import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';
export declare class MerchantsController {
    private readonly merchantsService;
    constructor(merchantsService: MerchantsService);
    register(name: string, phone: string, passwordPlain: string, initialBalance?: number): Promise<Merchant>;
    findOne(id: string): Promise<Merchant>;
    setTransactionPin(phone: string, pin: string): Promise<{
        success: boolean;
    }>;
    verifyTransactionPin(phone: string, pin: string): Promise<{
        isMatch: boolean;
    }>;
}
