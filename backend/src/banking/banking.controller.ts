import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BankingService } from './banking.service';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('active-provider')
  getActiveProvider() {
    return {
      provider: this.bankingService.getActiveProvider().providerName,
      status: 'active',
    };
  }

  @Post('kyc-verify')
  @Post('sterling/kyc-verify')
  @HttpCode(HttpStatus.OK)
  async verifyKyc(
    @Body('idNumber') idNumber: string,
    @Body('idType') idType: 'bvn' | 'nin',
    @Body('fullName') fullName?: string,
  ) {
    return await this.bankingService.verifyKyc(idNumber, idType, fullName);
  }

  @Post('virtual-account')
  @Post('sterling/virtual-account')
  @HttpCode(HttpStatus.OK)
  async generateVirtualAccount(
    @Body('phone') phone: string,
    @Body('name') name: string,
    @Body('email') email?: string,
    @Body('bvn') bvn?: string,
  ) {
    return await this.bankingService.createVirtualAccount(
      phone,
      name,
      email,
      bvn,
    );
  }

  @Post('name-enquiry')
  @Post('sterling/name-enquiry')
  @HttpCode(HttpStatus.OK)
  async nameEnquiry(
    @Body('accountNumber') accountNumber: string,
    @Body('bankCode') bankCode: string,
  ) {
    return await this.bankingService.performNameEnquiry(
      accountNumber,
      bankCode,
    );
  }

  @Post('transfer')
  @Post('sterling/transfer')
  @HttpCode(HttpStatus.OK)
  async initiateTransfer(
    @Body('accountNumber') accountNumber: string,
    @Body('bankCode') bankCode: string,
    @Body('amount') amount: number,
    @Body('narration') narration: string,
  ) {
    return await this.bankingService.initiateTransfer(
      accountNumber,
      bankCode,
      amount,
      narration,
    );
  }

  @Post('webhook')
  @Post('sterling/webhook')
  @HttpCode(HttpStatus.OK)
  async processWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature?: string,
  ) {
    return await this.bankingService.processWebhook(payload, signature);
  }
}
