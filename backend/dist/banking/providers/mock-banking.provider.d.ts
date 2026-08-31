import { BankingProviderInterface, KycVerificationResult, VirtualAccountResult, NameEnquiryResult, TransferResult } from '../interfaces/banking-provider.interface';
export declare class MockBankingProvider implements BankingProviderInterface {
    readonly providerName = "mock";
    private readonly logger;
    verifyKyc(idNumber: string, idType: 'bvn' | 'nin', fullName?: string): Promise<KycVerificationResult>;
    createVirtualAccount(phone: string, name: string, _email?: string, _bvn?: string): Promise<VirtualAccountResult>;
    performNameEnquiry(accountNumber: string, bankCode: string): Promise<NameEnquiryResult>;
    initiateTransfer(accountNumber: string, bankCode: string, amount: number, _narration: string): Promise<TransferResult>;
    processWebhook(payload: any, _signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
