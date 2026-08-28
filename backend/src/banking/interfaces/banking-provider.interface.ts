export interface KycVerificationResult {
  valid: boolean;
  kycTier: string;
  verifiedName: string;
  message: string;
}

export interface VirtualAccountResult {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  currency: string;
  provider: string;
}

export interface NameEnquiryResult {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  sessionRef?: string;
}

export interface TransferResult {
  success: boolean;
  reference: string;
  message: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface BankingProviderInterface {
  readonly providerName: string;

  verifyKyc(
    idNumber: string,
    idType: 'bvn' | 'nin',
    fullName?: string,
  ): Promise<KycVerificationResult>;

  createVirtualAccount(
    phone: string,
    name: string,
    email?: string,
    bvn?: string,
  ): Promise<VirtualAccountResult>;

  performNameEnquiry(
    accountNumber: string,
    bankCode: string,
  ): Promise<NameEnquiryResult>;

  initiateTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    narration: string,
  ): Promise<TransferResult>;

  processWebhook(payload: any, signature?: string): Promise<{ success: boolean; message: string }>;
}
