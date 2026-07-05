import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(
    name: string,
    phone: string,
    publicKeyBase64: string,
    initialBalance = 10000.0,
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException(
        'A user with this phone number is already registered.',
      );
    }

    const user = this.userRepository.create({
      name,
      phone,
      publicKeyBase64,
      balance: initialBalance,
    });

    return await this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(`User with phone number ${phone} not found.`);
    }
    return user;
  }

  async setTransactionPin(
    phone: string,
    pin: string,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException('Customer account not found.');
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      throw new BadRequestException(
        'Transaction PIN must be a 4-digit number.',
      );
    }
    const saltRounds = 10;
    user.transactionPinHash = await bcrypt.hash(pin, saltRounds);
    await this.userRepository.save(user);
    return { success: true };
  }

  async verifyTransactionPin(
    phone: string,
    pin: string,
  ): Promise<{ isMatch: boolean }> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user || !user.transactionPinHash) {
      return { isMatch: false };
    }
    const isMatch = await bcrypt.compare(pin, user.transactionPinHash);
    return { isMatch };
  }

  async transfer(
    senderPhone: string,
    recipientPhone: string,
    amount: number,
    pin: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.userRepository.manager.transaction(async (entityManager) => {
      const sender = await entityManager.findOne(User, {
        where: { phone: senderPhone },
      });
      if (!sender) {
        throw new NotFoundException('Sender account not found.');
      }

      if (!sender.transactionPinHash) {
        throw new BadRequestException('Transaction PIN is not configured.');
      }
      const isMatch = await bcrypt.compare(pin, sender.transactionPinHash);
      if (!isMatch) {
        throw new BadRequestException('Incorrect transaction PIN.');
      }

      const recipient = await entityManager.findOne(User, {
        where: { phone: recipientPhone },
      });
      if (!recipient) {
        throw new NotFoundException('Recipient account not found.');
      }

      if (sender.id === recipient.id) {
        throw new BadRequestException('Cannot transfer to yourself.');
      }

      if (sender.balance < amount) {
        throw new BadRequestException('Insufficient wallet balance.');
      }

      sender.balance = Number(sender.balance) - amount;
      recipient.balance = Number(recipient.balance) + amount;

      await entityManager.save(User, sender);
      await entityManager.save(User, recipient);

      const timestamp = Date.now();
      const nonce = Math.floor(100000 + Math.random() * 900000);

      const debitTx = entityManager.create(Transaction, {
        customerId: sender.id,
        vendorId: `USER_${recipient.id}`,
        amount: amount,
        nonce: nonce,
        timestamp: timestamp,
        signature: 'P2P_TRANSFER',
      });
      await entityManager.save(Transaction, debitTx);

      return {
        success: true,
        message: `Successfully transferred ₦${amount.toFixed(2)} to ${recipient.name}.`,
      };
    });
  }
}
