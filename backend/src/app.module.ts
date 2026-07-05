import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Merchant } from './merchants/entities/merchant.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { UsersModule } from './users/users.module';
import { MerchantsModule } from './merchants/merchants.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'eazypay.sqlite',
      entities: [User, Merchant, Transaction],
      synchronize: true, // Automatically synchronize table schemas (ideal for prototyping)
    }),
    UsersModule,
    MerchantsModule,
    AuthModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
