import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  vendorId: string;

  @Column('double')
  amount: number;

  @Column()
  nonce: number;

  @Column('bigint')
  timestamp: number;

  @Column({ type: 'text' })
  signature: string;

  @CreateDateColumn()
  syncedAt: Date;
}
