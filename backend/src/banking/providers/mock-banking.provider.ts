import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  BankingProviderInterface,
  KycVerificationResult,
  VirtualAccountResult,
  NameEnquiryResult,
  TransferResult,
} from '../interfaces/banking-provider.interface';

@Injectable()
export class MockBankingProvider implements BankingProviderInterface {
  readonly providerName = 'mock';
  private readonly logger = new Logger(MockBankingProvider.name);

  async verifyKyc(
    idNumber: string,
    idType: 'bvn' | 'nin',
    fullName?: string,
  ): Promise<KycVerificationResult> {
    const cleanId = (idNumber || '').replace(/\D/g, '');
    if (cleanId.length !== 11) {
      throw new BadRequestException(
        `${idType.toUpperCase()} must be exactly 11 numeric digits under CBN regulations.`,
      );
    }
    this.logger.log(
      `[MOCK KYC] Verified ${idType.toUpperCase()}: ${cleanId} for ${fullName || 'User'}`,
    );
    return {
      valid: true,
      kycTier: 'tier2',
      verifiedName: fullName || 'Joy Adaeze',
      message: `${idType.toUpperCase()} (${cleanId}) verified successfully via NIBSS/NIMC Gateway (Mock Provider).`,
    };
  }

  async createVirtualAccount(
    phone: string,
    name: string,
    email?: string,
    bvn?: string,
  ): Promise<VirtualAccountResult> {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const accountSuffix =
      cleanPhone.length >= 7 ? cleanPhone.slice(-7) : '2837410';
    const accountNumber = `99${accountSuffix}`;

    this.logger.log(
      `[MOCK DVA] Generated Virtual NUBAN ${accountNumber} for ${name}`,
    );
    return {
      accountNumber,
      accountName: `EazyPay / ${name}`,
      bankName: 'Wema Bank (EazyPay Gateway)',
      bankCode: '035',
      currency: 'NGN',
      provider: 'mock',
    };
  }

  async performNameEnquiry(
    accountNumber: string,
    bankCode: string,
  ): Promise<NameEnquiryResult> {
    this.logger.log(
      `[MOCK NUBAN ENQUIRY] Checking ${accountNumber} at Bank Code ${bankCode}`,
    );
    return {
      accountNumber,
      accountName: 'Babcock Merchant Vendor',
      bankName: 'GTBank',
      bankCode: bankCode || '058',
      sessionRef: `MOCK-SESS-${Date.now()}`,
    };
  }

  async initiateTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    narration: string,
  ): Promise<TransferResult> {
    const reference = `EP-NIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.logger.log(
      `[MOCK NIP TRANSFER] Sent ₦${amount} to ${accountNumber} (Ref: ${reference})`,
    );
    return {
      success: true,
      reference,
      status: 'SUCCESS',
      message: `₦${amount} transferred successfully to account ${accountNumber}. (Mock Gateway)`,
    };
  }

  async processWebhook(
    payload: any,
    signature?: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `[MOCK WEBHOOK] Processed inbound transfer event: ${JSON.stringify(payload)}`,
    );
    return {
      success: true,
      message: 'Mock deposit webhook received and processed.',
    };
  }
}
