import { TransactionsService } from './transactions.service';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import { Transaction } from './entities/transaction.entity';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    syncBatch(transactions: SyncTransactionDto[]): Promise<any[]>;
    findAll(): Promise<Transaction[]>;
}
