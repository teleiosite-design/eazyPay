import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SterlingService } from './sterling.service';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { MockBankingProvider } from './providers/mock-banking.provider';
import { PaystackBankingProvider } from './providers/paystack-banking.provider';
import { SterlingBankingProvider } from './providers/sterling-banking.provider';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant, Transaction])],
  controllers: [BankingController],
  providers: [
    SterlingService,
    BankingService,
    MockBankingProvider,
    PaystackBankingProvider,
    SterlingBankingProvider,
  ],
  exports: [BankingService, SterlingService],
})
export class BankingModule {}
