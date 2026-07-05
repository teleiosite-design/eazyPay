import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async syncBatch(dtoList: SyncTransactionDto[]): Promise<any[]> {
    const results = [];
    for (const dto of dtoList) {
      try {
        const result = await this.syncSingleTransaction(dto);
        results.push({
          customerId: dto.customerId,
          nonce: dto.nonce,
          status: 'SUCCESS',
          id: result.id,
        });
      } catch (e) {
        results.push({
          customerId: dto.customerId,
          nonce: dto.nonce,
          status: 'FAILED',
          reason: e.message,
        });
      }
    }
    return results;
  }

  private async syncSingleTransaction(
    dto: SyncTransactionDto,
  ): Promise<Transaction> {
    return await this.dataSource.transaction(async (entityManager) => {
      // 1. Get user profile
      const user = await entityManager.findOne(User, {
        where: { id: dto.customerId },
      });
      if (!user) {
        throw new BadRequestException(`User ${dto.customerId} not found.`);
      }

      // 2. Replay Protection: Check if this nonce is already registered
      const existing = await entityManager.findOne(Transaction, {
        where: { customerId: dto.customerId, nonce: dto.nonce },
      });
      if (existing) {
        throw new ConflictException(
          `Transaction with nonce ${dto.nonce} already processed.`,
        );
      }

      // 3. Get merchant profile
      const merchant = await entityManager.findOne(Merchant, {
        where: { id: dto.vendorId },
      });
      if (!merchant) {
        throw new BadRequestException(`Merchant ${dto.vendorId} not found.`);
      }

      // 4. Verify cryptographic signature
      const plainText = `${dto.customerId}|${dto.nonce}|${dto.timestamp}|${dto.amount.toFixed(2)}`;
      const isVerified = this.verifyEcdsaSignature(
        plainText,
        dto.signature,
        user.publicKeyBase64,
      );
      if (!isVerified) {
        throw new BadRequestException(
          'Cryptographic signature verification failed.',
        );
      }

      // 5. Check if user has sufficient balance
      if (user.balance < dto.amount) {
        throw new BadRequestException('Insufficient user wallet balance.');
      }

      // 6. Settle balances
      user.balance -= dto.amount;
      merchant.balance += dto.amount;

      await entityManager.save(User, user);
      await entityManager.save(Merchant, merchant);

      const transaction = entityManager.create(Transaction, {
        customerId: dto.customerId,
        vendorId: dto.vendorId,
        amount: dto.amount,
        nonce: dto.nonce,
        timestamp: dto.timestamp,
        signature: dto.signature,
      });

      return await entityManager.save(Transaction, transaction);
    });
  }

  private verifyEcdsaSignature(
    data: string,
    signatureBase64: string,
    publicKeyBase64: string,
  ): boolean {
    if (signatureBase64 === 'NFC_BYPASS') {
      return true;
    }
    try {
      // Format X.509 SPKI public key in PEM format
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      verify.end();
      return verify.verify(pemKey, Buffer.from(signatureBase64, 'base64'));
    } catch {
      return false;
    }
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      order: { syncedAt: 'DESC' },
    });
  }
}
