export class SyncTransactionDto {
  customerId: string;
  vendorId: string;
  amount: number;
  nonce: number;
  timestamp: number;
  signature: string;
}
