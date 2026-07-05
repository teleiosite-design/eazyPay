import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly jwtService: JwtService,
  ) {}

  async validateMerchant(phone: string, passwordPlain: string): Promise<any> {
    const merchant = await this.merchantRepository.findOne({
      where: { phone },
    });
    if (merchant) {
      const isPasswordMatching = await bcrypt.compare(
        passwordPlain,
        merchant.passwordHash,
      );
      if (isPasswordMatching) {
        const result = { ...merchant };
        delete result.passwordHash;
        return { ...result, role: 'merchant' };
      }
    }

    const customer = await this.userRepository.findOne({
      where: { phone },
    });
    if (customer && customer.transactionPinHash) {
      const isPinMatching = await bcrypt.compare(
        passwordPlain,
        customer.transactionPinHash,
      );
      if (isPinMatching) {
        const result = { ...customer };
        delete result.transactionPinHash;
        return { ...result, role: 'customer' };
      }
    }

    throw new UnauthorizedException('Invalid phone number or passcode.');
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      name: user.name,
    };
    const isMerchant = user.role === 'merchant';
    return {
      accessToken: this.jwtService.sign(payload),
      [isMerchant ? 'merchant' : 'customer']: user,
    };
  }

  // 1. Generate & Send OTP
  async sendOtp(
    phone: string,
    role: string,
  ): Promise<{ success: boolean; otpCode: string }> {
    // Generate a secure 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // Valid for 5 minutes

    if (role === 'customer') {
      const user = await this.userRepository.findOne({ where: { phone } });
      if (!user)
        throw new NotFoundException(
          'No customer account found with this phone number.',
        );
      user.otpCode = otpCode;
      user.otpExpiry = otpExpiry;
      await this.userRepository.save(user);
    } else {
      const merchant = await this.merchantRepository.findOne({
        where: { phone },
      });
      if (!merchant)
        throw new NotFoundException(
          'No merchant account found with this phone number.',
        );
      merchant.otpCode = otpCode;
      merchant.otpExpiry = otpExpiry;
      await this.merchantRepository.save(merchant);
    }

    // In a production application, this calls an SMS service (e.g. Termii / Twilio)
    console.log(`[FINTECH OTP SMS] Sent to ${phone}: Code ${otpCode}`);
    return { success: true, otpCode };
  }

  // 2. Verify OTP
  async verifyOtp(
    phone: string,
    otp: string,
    role: string,
  ): Promise<{ success: boolean }> {
    if (role === 'customer') {
      const user = await this.userRepository.findOne({ where: { phone } });
      if (!user) throw new NotFoundException('User not found.');
      if (
        !user.otpCode ||
        user.otpCode !== otp ||
        !user.otpExpiry ||
        user.otpExpiry < new Date()
      ) {
        throw new BadRequestException('Invalid or expired OTP code.');
      }
      user.isPhoneVerified = true;
      user.otpCode = null;
      user.otpExpiry = null;
      await this.userRepository.save(user);
    } else {
      const merchant = await this.merchantRepository.findOne({
        where: { phone },
      });
      if (!merchant) throw new NotFoundException('Merchant not found.');
      if (
        !merchant.otpCode ||
        merchant.otpCode !== otp ||
        !merchant.otpExpiry ||
        merchant.otpExpiry < new Date()
      ) {
        throw new BadRequestException('Invalid or expired OTP code.');
      }
      merchant.isPhoneVerified = true;
      merchant.otpCode = null;
      merchant.otpExpiry = null;
      await this.merchantRepository.save(merchant);
    }
    return { success: true };
  }

  // 3. Password recovery initialization
  async forgotPassword(
    phone: string,
    role: string,
  ): Promise<{ success: boolean; otpCode: string }> {
    // Triggers OTP generation for resetting password
    return await this.sendOtp(phone, role);
  }

  // 4. Reset Password
  async resetPassword(
    phone: string,
    otp: string,
    newPasswordPlain: string,
    role: string,
  ): Promise<{ success: boolean }> {
    // First verify the OTP
    await this.verifyOtp(phone, otp, role);

    if (role === 'customer') {
      throw new BadRequestException(
        'Customers reset their login using transaction PIN settings.',
      );
    } else {
      const merchant = await this.merchantRepository.findOne({
        where: { phone },
      });
      if (!merchant) throw new NotFoundException('Merchant not found.');

      const saltRounds = 10;
      merchant.passwordHash = await bcrypt.hash(newPasswordPlain, saltRounds);
      await this.merchantRepository.save(merchant);
    }
    return { success: true };
  }
}
