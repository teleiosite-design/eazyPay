import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  cacNumber: string;

  @Column({ type: 'text', nullable: true })
  nin: string;

  @Column({ type: 'text', nullable: true })
  bvn: string;

  @Column({ type: 'text', nullable: true, default: 'nin' })
  idType: string;

  @Column({ type: 'text', nullable: true })
  idNumber: string;

  @Column({ type: 'text', nullable: true, default: 'GTBank' })
  bankName: string;

  @Column({ type: 'text', nullable: true })
  accountNumber: string;

  @Column({ type: 'text', default: 'tier2' })
  kycTier: string;

  @Column()
  passwordHash: string;

  @Column('double', { default: 0.0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  transactionPinHash: string;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  otpCode: string;

  @Column({ type: 'datetime', nullable: true })
  otpExpiry: Date;
}
