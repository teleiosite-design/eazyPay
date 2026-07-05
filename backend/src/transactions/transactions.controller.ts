import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Transaction } from './entities/transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async syncBatch(
    @Body('transactions') transactions: SyncTransactionDto[],
  ): Promise<any[]> {
    return await this.transactionsService.syncBatch(transactions || []);
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return await this.transactionsService.findAll();
  }
}
