import { Injectable, Logger } from '@nestjs/common';
import {
  BankingProviderInterface,
  KycVerificationResult,
  VirtualAccountResult,
  NameEnquiryResult,
  TransferResult,
} from '../interfaces/banking-provider.interface';
import { SterlingService } from '../sterling.service';

@Injectable()
export class SterlingBankingProvider implements BankingProviderInterface {
  readonly providerName = 'sterling';
  private readonly logger = new Logger(SterlingBankingProvider.name);

  constructor(private readonly sterlingService: SterlingService) {}

  async verifyKyc(
    idNumber: string,
    idType: 'bvn' | 'nin',
    fullName?: string,
  ): Promise<KycVerificationResult> {
    const res = await this.sterlingService.verifyKycWithSterling(idNumber, idType, fullName);
    return {
      valid: res.valid,
      kycTier: res.kycTier,
      verifiedName: res.verifiedName || fullName || 'User',
      message: res.message,
    };
  }

  async createVirtualAccount(
    phone: string,
    name: string,
    email?: string,
    bvn?: string,
  ): Promise<VirtualAccountResult> {
    const res = await this.sterlingService.generateVirtualAccount(phone, name, bvn);
    return {
      accountNumber: res.accountNumber,
      accountName: res.accountName,
      bankName: res.bankName,
      bankCode: res.bankCode,
      currency: res.currency,
      provider: 'sterling',
    };
  }

  async performNameEnquiry(
    accountNumber: string,
    bankCode: string,
  ): Promise<NameEnquiryResult> {
    const res = await this.sterlingService.performNameEnquiry(accountNumber, bankCode);
    return {
      accountNumber: res.accountNumber,
      accountName: res.accountName,
      bankName: res.bankName,
      bankCode: res.bankCode,
    };
  }

  async initiateTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    narration: string,
  ): Promise<TransferResult> {
    const res = await this.sterlingService.initiateNipTransfer(accountNumber, bankCode, amount, narration);
    return {
      success: res.success,
      reference: res.reference,
      status: res.success ? 'SUCCESS' : 'FAILED',
      message: res.message,
    };
  }

  async processWebhook(payload: any, signature?: string): Promise<{ success: boolean; message: string }> {
    return await this.sterlingService.processWebhook(payload, signature);
  }
}
