import { BankingProviderInterface } from './interfaces/banking-provider.interface';
import { MockBankingProvider } from './providers/mock-banking.provider';
import { PaystackBankingProvider } from './providers/paystack-banking.provider';
import { SterlingBankingProvider } from './providers/sterling-banking.provider';
export declare class BankingService {
    private readonly mockProvider;
    private readonly paystackProvider;
    private readonly sterlingProvider;
    private readonly logger;
    constructor(mockProvider: MockBankingProvider, paystackProvider: PaystackBankingProvider, sterlingProvider: SterlingBankingProvider);
    getActiveProvider(): BankingProviderInterface;
    verifyKyc(idNumber: string, idType: 'bvn' | 'nin', fullName?: string): Promise<import("./interfaces/banking-provider.interface").KycVerificationResult>;
    createVirtualAccount(phone: string, name: string, email?: string, bvn?: string): Promise<import("./interfaces/banking-provider.interface").VirtualAccountResult>;
    performNameEnquiry(accountNumber: string, bankCode: string): Promise<import("./interfaces/banking-provider.interface").NameEnquiryResult>;
    initiateTransfer(accountNumber: string, bankCode: string, amount: number, narration: string): Promise<import("./interfaces/banking-provider.interface").TransferResult>;
    processWebhook(payload: any, signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
