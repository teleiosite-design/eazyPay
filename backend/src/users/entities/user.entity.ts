import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column('double', { default: 0.0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  publicKeyBase64: string;

  @Column({ type: 'text', nullable: true })
  transactionPinHash: string;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'text', nullable: true })
  bvn: string;

  @Column({ type: 'text', nullable: true })
  otpCode: string;

  @Column({ type: 'datetime', nullable: true })
  otpExpiry: Date;
}
