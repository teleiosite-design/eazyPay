import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
export declare class TransactionsService {
    private readonly transactionRepository;
    private readonly dataSource;
    constructor(transactionRepository: Repository<Transaction>, dataSource: DataSource);
    syncBatch(dtoList: SyncTransactionDto[]): Promise<any[]>;
    private syncSingleTransaction;
    private verifyEcdsaSignature;
    findAll(): Promise<Transaction[]>;
}
