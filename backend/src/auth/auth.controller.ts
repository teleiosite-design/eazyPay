import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('phone') phone: string,
    @Body('password') passwordPlain: string,
  ) {
    const validatedMerchant = await this.authService.validateMerchant(
      phone,
      passwordPlain,
    );
    return await this.authService.login(validatedMerchant);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('phone') phone: string, @Body('role') role: string) {
    return await this.authService.sendOtp(phone, role);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Body('role') role: string,
  ) {
    return await this.authService.verifyOtp(phone, otp, role);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body('phone') phone: string,
    @Body('role') role: string,
  ) {
    return await this.authService.forgotPassword(phone, role);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPasswordPlain: string,
    @Body('role') role: string,
  ) {
    return await this.authService.resetPassword(
      phone,
      otp,
      newPasswordPlain,
      role,
    );
  }
}
