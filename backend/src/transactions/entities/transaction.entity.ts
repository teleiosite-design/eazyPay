import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('transactions')
@Index(['customerId', 'nonce'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  customerId: string;

  @Column()
  @Index()
  vendorId: string;

  @Column('double')
  amount: number;

  @Column()
  nonce: number;

  @Column('bigint')
  @Index()
  timestamp: number;

  @Column({ type: 'text' })
  signature: string;

  @CreateDateColumn()
  syncedAt: Date;
}
