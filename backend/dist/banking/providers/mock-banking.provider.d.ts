import { BankingProviderInterface, KycVerificationResult, VirtualAccountResult, NameEnquiryResult, TransferResult } from '../interfaces/banking-provider.interface';
export declare class MockBankingProvider implements BankingProviderInterface {
    readonly providerName = "mock";
    private readonly logger;
    verifyKyc(idNumber: string, idType: 'bvn' | 'nin', fullName?: string): Promise<KycVerificationResult>;
    createVirtualAccount(phone: string, name: string, email?: string, bvn?: string): Promise<VirtualAccountResult>;
    performNameEnquiry(accountNumber: string, bankCode: string): Promise<NameEnquiryResult>;
    initiateTransfer(accountNumber: string, bankCode: string, amount: number, narration: string): Promise<TransferResult>;
    processWebhook(payload: any, signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
