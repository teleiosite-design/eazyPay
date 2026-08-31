import { Injectable, Logger } from '@nestjs/common';
import { BankingProviderInterface } from './interfaces/banking-provider.interface';
import { MockBankingProvider } from './providers/mock-banking.provider';
import { PaystackBankingProvider } from './providers/paystack-banking.provider';
import { SterlingBankingProvider } from './providers/sterling-banking.provider';

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private readonly mockProvider: MockBankingProvider,
    private readonly paystackProvider: PaystackBankingProvider,
    private readonly sterlingProvider: SterlingBankingProvider,
  ) {}

  /**
   * Returns the active Banking Provider based on environment configuration (BANKING_PROVIDER).
   * Supported options: 'mock' (default), 'paystack', 'sterling', 'monnify', 'nomba'.
   */
  getActiveProvider(): BankingProviderInterface {
    const configuredProvider = (
      process.env.BANKING_PROVIDER || 'mock'
    ).toLowerCase();

    switch (configuredProvider) {
      case 'paystack':
        this.logger.log(`[BANKING GATEWAY] Active Provider: PAYSTACK DVA`);
        return this.paystackProvider;
      case 'sterling':
        this.logger.log(
          `[BANKING GATEWAY] Active Provider: STERLING BANK BaaS`,
        );
        return this.sterlingProvider;
      case 'mock':
      default:
        this.logger.log(
          `[BANKING GATEWAY] Active Provider: MOCK GATEWAY (Development / Demo Mode)`,
        );
        return this.mockProvider;
    }
  }

  async verifyKyc(idNumber: string, idType: 'bvn' | 'nin', fullName?: string) {
    return await this.getActiveProvider().verifyKyc(idNumber, idType, fullName);
  }

  async createVirtualAccount(
    phone: string,
    name: string,
    email?: string,
    bvn?: string,
  ) {
    return await this.getActiveProvider().createVirtualAccount(
      phone,
      name,
      email,
      bvn,
    );
  }

  async performNameEnquiry(accountNumber: string, bankCode: string) {
    return await this.getActiveProvider().performNameEnquiry(
      accountNumber,
      bankCode,
    );
  }

  async initiateTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    narration: string,
  ) {
    return await this.getActiveProvider().initiateTransfer(
      accountNumber,
      bankCode,
      amount,
      narration,
    );
  }

  async processWebhook(payload: any, signature?: string) {
    return await this.getActiveProvider().processWebhook(payload, signature);
  }
}
