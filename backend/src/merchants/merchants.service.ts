import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async register(
    name: string,
    phone: string,
    passwordPlain: string,
    initialBalance = 0.0,
  ): Promise<Merchant> {
    const existing = await this.merchantRepository.findOne({
      where: { phone },
    });
    if (existing) {
      throw new ConflictException(
        'A merchant with this phone number is already registered.',
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    const merchant = this.merchantRepository.create({
      name,
      phone,
      passwordHash,
      balance: initialBalance,
    });

    const saved = await this.merchantRepository.save(merchant);

    // Hide passwordHash from JSON responses
    delete saved.passwordHash;
    return saved;
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found.`);
    }
    return merchant;
  }

  async findByPhone(phone: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { phone },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant with phone ${phone} not found.`);
    }
    return merchant;
  }

  async setTransactionPin(
    phone: string,
    pin: string,
  ): Promise<{ success: boolean }> {
    const merchant = await this.merchantRepository.findOne({ where: { phone } });
    if (!merchant) {
      throw new NotFoundException('Merchant account not found.');
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      throw new BadRequestException(
        'Transaction PIN must be a 4-digit number.',
      );
    }
    const saltRounds = 10;
    merchant.transactionPinHash = await bcrypt.hash(pin, saltRounds);
    await this.merchantRepository.save(merchant);
    return { success: true };
  }

  async verifyTransactionPin(
    phone: string,
    pin: string,
  ): Promise<{ isMatch: boolean }> {
    const merchant = await this.merchantRepository.findOne({ where: { phone } });
    if (!merchant || !merchant.transactionPinHash) {
      return { isMatch: false };
    }
    const isMatch = await bcrypt.compare(pin, merchant.transactionPinHash);
    return { isMatch };
  }
}
