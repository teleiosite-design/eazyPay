export type UserRole = 'customer' | 'vendor' | 'student';

export type ScreenRoute = 
  | 'splash'
  | 'onboarding'
  | 'register'
  | 'otp'
  | 'set_pin'
  | 'customer_main'
  | 'student_main'
  | 'vendor_main'
  | 'demo_split_screen';

export type ThemePreferenceMode = 'system' | 'light' | 'dark';

export type IdType = 'nin' | 'bvn' | 'passport' | 'voters_card' | 'drivers_license' | 'campus_id';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  level: string;
  balance: number;
  institutionId?: string;
  memberId?: string;
  nin?: string;
  bvn?: string;
  idType?: IdType;
  idNumber?: string;
  kycTier?: 'tier1' | 'tier2';
  sterlingNuban?: string;
}

export interface StudentUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  level: string;
  balance: number;
  institutionId?: string;
  memberId?: string;
  nin?: string;
  bvn?: string;
  idType?: IdType;
  idNumber?: string;
  kycTier?: 'tier1' | 'tier2';
  sterlingNuban?: string;
}

export interface VendorUser {
  id: string;
  name: string;
  phone: string;
  todayEarnings: number;
  bankName: string;
  accountNumber: string;
  email?: string;
  cacNumber?: string;
  nin?: string;
  bvn?: string;
  idType?: IdType;
  idNumber?: string;
  kycTier?: 'tier1' | 'tier2';
  sterlingNuban?: string;
}

export interface Transaction {
  id?: number;
  title: string;
  category: 'food' | 'print' | 'topup' | 'transport' | 'other';
  timestamp?: number;
  amount: number;
  isDebit: boolean;
  syncStatus: 'Pending' | 'Synced';
  hash: string;
  prevHash: string;
  signature: string;
  txRef: string;
  nonce?: number;
  customerId?: string;
  vendorId?: string;
  payerId?: string;
  payeeId?: string;
  deviceId?: string;
  nfcCardId?: string;
  fee?: number;
  campusId?: string;
  idempotencyKey?: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  category: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'User' | 'Agent';
  message: string;
  timestamp: number;
}

// Sterling Bank API Interfaces
export interface SterlingVirtualAccountResponse {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  currency: string;
}

export interface SterlingNameEnquiryRequest {
  accountNumber: string;
  bankCode: string;
}

export interface SterlingNameEnquiryResponse {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

export interface SterlingKycRequest {
  idNumber: string;
  idType: 'bvn' | 'nin';
  fullName?: string;
}

export interface SterlingKycResponse {
  valid: boolean;
  message: string;
  verifiedName?: string;
  kycTier: string;
}

export interface SterlingTransferRequest {
  accountNumber: string;
  bankCode: string;
  amount: number;
  narration: string;
}

export interface SterlingTransferResponse {
  success: boolean;
  reference: string;
  message: string;
}

// Standard API Payloads & Responses
export interface RegisterCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  department?: string;
  level?: string;
  institutionId?: string;
  memberId?: string;
  idType?: IdType;
  idNumber?: string;
  nin?: string;
  bvn?: string;
  publicKeyBase64: string;
  initialBalance?: number;
}

export interface RegisterMerchantRequest {
  name: string;
  phone: string;
  password: string;
  email?: string;
  cacNumber?: string;
  idType?: IdType;
  idNumber?: string;
  nin?: string;
  bvn?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface VerifyKycRequest {
  idType: IdType;
  idNumber: string;
  fullName?: string;
  institutionId?: string;
}

export interface VerifyKycResponse {
  valid: boolean;
  message: string;
  kycTier: 'tier1' | 'tier2';
  verifiedName?: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  phone: string;
  balance: number;
  publicKeyBase64?: string;
  isPhoneVerified: boolean;
  kycTier?: string;
}

export interface MerchantResponse {
  id: string;
  name: string;
  phone: string;
  balance: number;
  isPhoneVerified: boolean;
  kycTier?: string;
}

export interface SendOtpRequest {
  phone?: string;
  email?: string;
  target?: string;
  role: string;
}

export interface SendOtpResponse {
  success: boolean;
  otpCode?: string;
  message?: string;
}

export interface VerifyOtpRequest {
  phone?: string;
  email?: string;
  target?: string;
  otp: string;
  role: string;
}

export interface VerifyOtpResponse {
  success: boolean;
}

export interface SetPinRequest {
  phone: string;
  pin: string;
}

export interface SetPinResponse {
  success: boolean;
}

export interface TransferRequest {
  recipientPhone: string;
  amount: number;
  pin: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
}

export interface SyncTransactionPayload {
  customerId: string;
  vendorId: string;
  amount: number;
  nonce: number;
  timestamp: number;
  signature: string;
}

export interface SyncTransactionResult {
  customerId: string;
  nonce: number;
  status: 'SUCCESS' | 'FAILED';
  id?: string;
  reason?: string;
}
