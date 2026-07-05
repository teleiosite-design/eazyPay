import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('phone') phone: string,
    @Body('password') passwordPlain: string,
    @Body('initialBalance') initialBalance?: number,
  ): Promise<Merchant> {
    return await this.merchantsService.register(
      name,
      phone,
      passwordPlain,
      initialBalance,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Merchant> {
    return await this.merchantsService.findOne(id);
  }

  @Post('set-pin')
  async setTransactionPin(
    @Body('phone') phone: string,
    @Body('pin') pin: string,
  ): Promise<{ success: boolean }> {
    return await this.merchantsService.setTransactionPin(phone, pin);
  }

  @Post('verify-pin')
  async verifyTransactionPin(
    @Body('phone') phone: string,
    @Body('pin') pin: string,
  ): Promise<{ isMatch: boolean }> {
    return await this.merchantsService.verifyTransactionPin(phone, pin);
  }
}
