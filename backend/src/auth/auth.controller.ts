import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('password') passwordPlain?: string,
  ) {
    const identifier = email || phone || '';
    const validatedMerchant = await this.authService.validateMerchant(
      identifier,
      passwordPlain || '',
    );
    return await this.authService.login(validatedMerchant);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('target') targetInput?: string,
    @Body('role') role: string = 'customer',
  ) {
    const target = email || targetInput || phone || '';
    return await this.authService.sendOtp(target, role, email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('target') targetInput?: string,
    @Body('otp') otp: string = '',
    @Body('role') role: string = 'customer',
  ) {
    const target = email || targetInput || phone || '';
    return await this.authService.verifyOtp(target, otp, role);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('target') targetInput?: string,
    @Body('role') role: string = 'customer',
  ) {
    const target = email || targetInput || phone || '';
    return await this.authService.forgotPassword(target, role);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('target') targetInput?: string,
    @Body('otp') otp: string = '',
    @Body('newPassword') newPasswordPlain: string = '',
    @Body('role') role: string = 'customer',
  ) {
    const target = email || targetInput || phone || '';
    return await this.authService.resetPassword(
      target,
      otp,
      newPasswordPlain,
      role,
    );
  }
}
