import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  level: string;

  @Column({ type: 'text', nullable: true, default: 'babcock.edu.ng' })
  institutionId: string;

  @Column({ type: 'text', nullable: true })
  memberId: string;

  @Column({ type: 'text', nullable: true })
  nin: string;

  @Column({ type: 'text', nullable: true })
  bvn: string;

  @Column({ type: 'text', nullable: true, default: 'nin' })
  idType: string;

  @Column({ type: 'text', nullable: true })
  idNumber: string;

  @Column({ type: 'text', default: 'tier1' })
  kycTier: string;

  @Column('double', { default: 0.0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  publicKeyBase64: string;

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
