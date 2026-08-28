import { BankingService } from './banking.service';
export declare class BankingController {
    private readonly bankingService;
    constructor(bankingService: BankingService);
    getActiveProvider(): {
        provider: string;
        status: string;
    };
    verifyKyc(idNumber: string, idType: 'bvn' | 'nin', fullName?: string): Promise<import("./interfaces/banking-provider.interface").KycVerificationResult>;
    generateVirtualAccount(phone: string, name: string, email?: string, bvn?: string): Promise<import("./interfaces/banking-provider.interface").VirtualAccountResult>;
    nameEnquiry(accountNumber: string, bankCode: string): Promise<import("./interfaces/banking-provider.interface").NameEnquiryResult>;
    initiateTransfer(accountNumber: string, bankCode: string, amount: number, narration: string): Promise<import("./interfaces/banking-provider.interface").TransferResult>;
    processWebhook(payload: any, signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
