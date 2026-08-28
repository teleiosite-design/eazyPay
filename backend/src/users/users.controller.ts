import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('phone') phone: string,
    @Body('publicKeyBase64') publicKeyBase64: string,
    @Body('initialBalance') initialBalance?: number,
    @Body('email') email?: string,
    @Body('department') department?: string,
    @Body('level') level?: string,
    @Body('institutionId') institutionId?: string,
    @Body('memberId') memberId?: string,
    @Body('idType') idType?: string,
    @Body('idNumber') idNumber?: string,
    @Body('nin') nin?: string,
    @Body('bvn') bvn?: string,
  ): Promise<User> {
    return await this.usersService.register(
      name,
      phone,
      publicKeyBase64,
      initialBalance,
      email,
      department,
      level,
      institutionId,
      memberId,
      idType,
      idNumber,
      nin,
      bvn,
    );
  }

  @Post('verify-kyc')
  async verifyKyc(
    @Body('idType') idType: string,
    @Body('idNumber') idNumber: string,
    @Body('fullName') fullName?: string,
  ): Promise<{ valid: boolean; message: string; kycTier: string; verifiedName?: string }> {
    return await this.usersService.verifyKyc(idType, idNumber, fullName);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Post('set-pin')
  async setTransactionPin(
    @Body('phone') phone: string,
    @Body('pin') pin: string,
  ): Promise<{ success: boolean }> {
    return await this.usersService.setTransactionPin(phone, pin);
  }

  @Post('verify-pin')
  async verifyTransactionPin(
    @Body('phone') phone: string,
    @Body('pin') pin: string,
  ): Promise<{ isMatch: boolean }> {
    return await this.usersService.verifyTransactionPin(phone, pin);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  async transfer(
    @Request() req: any,
    @Body('recipientPhone') recipientPhone: string,
    @Body('amount') amount: number,
    @Body('pin') pin: string,
  ): Promise<{ success: boolean; message: string }> {
    const senderPhone = req.user.phone;
    return await this.usersService.transfer(
      senderPhone,
      recipientPhone,
      amount,
      pin,
    );
  }
}
