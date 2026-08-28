import {
  RegisterCustomerRequest,
  RegisterMerchantRequest,
  CustomerResponse,
  MerchantResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  SetPinRequest,
  SetPinResponse,
  TransferRequest,
  TransferResponse,
  SyncTransactionPayload,
  VerifyKycRequest,
  VerifyKycResponse,
  SterlingVirtualAccountResponse,
  SterlingNameEnquiryRequest,
  SterlingNameEnquiryResponse,
  SterlingKycRequest,
  SterlingKycResponse,
  SterlingTransferRequest,
  SterlingTransferResponse,
} from '../types';
import { Platform } from 'react-native';

// Standard Android emulator uses 10.0.2.2 to connect to host port 3000. iOS simulator uses localhost.
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.message) errorMsg = parsed.message;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const ApiService = {
  // Sterling Bank BaaS KYC Verification
  async verifySterlingKyc(data: SterlingKycRequest): Promise<SterlingKycResponse> {
    return fetchJson<SterlingKycResponse>('/banking/sterling/kyc-verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sterling Virtual Account Generation
  async generateSterlingVirtualAccount(phone: string, name: string, bvn?: string): Promise<SterlingVirtualAccountResponse> {
    return fetchJson<SterlingVirtualAccountResponse>('/banking/sterling/virtual-account', {
      method: 'POST',
      body: JSON.stringify({ phone, name, bvn }),
    });
  },

  // Sterling Inter-Bank NUBAN Name Enquiry
  async sterlingNameEnquiry(data: SterlingNameEnquiryRequest): Promise<SterlingNameEnquiryResponse> {
    return fetchJson<SterlingNameEnquiryResponse>('/banking/sterling/name-enquiry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sterling NIP Bank Transfer / Settlement
  async initiateSterlingNipTransfer(data: SterlingTransferRequest): Promise<SterlingTransferResponse> {
    return fetchJson<SterlingTransferResponse>('/banking/sterling/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Standard EazyPay Wallet Endpoints
  async registerCustomer(data: RegisterCustomerRequest): Promise<CustomerResponse> {
    return fetchJson<CustomerResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerMerchant(data: RegisterMerchantRequest): Promise<MerchantResponse> {
    return fetchJson<MerchantResponse>('/merchants/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyKyc(data: VerifyKycRequest): Promise<VerifyKycResponse> {
    return fetchJson<VerifyKycResponse>('/users/verify-kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    return fetchJson<SendOtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return fetchJson<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async setCustomerPin(data: SetPinRequest): Promise<SetPinResponse> {
    return fetchJson<SetPinResponse>('/users/set-pin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async setMerchantPin(data: SetPinRequest): Promise<SetPinResponse> {
    return fetchJson<SetPinResponse>('/merchants/set-pin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCustomerProfile(id: string): Promise<CustomerResponse> {
    return fetchJson<CustomerResponse>(`/users/${id}`);
  },

  async getMerchantProfile(id: string): Promise<MerchantResponse> {
    return fetchJson<MerchantResponse>(`/merchants/${id}`);
  },

  async transferFunds(token: string, data: TransferRequest): Promise<TransferResponse> {
    return fetchJson<TransferResponse>('/users/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async login(identifier: string, passwordPlain: string): Promise<{ accessToken: string; customer?: any; merchant?: any }> {
    return fetchJson<{ accessToken: string; customer?: any; merchant?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password: passwordPlain,
      }),
    });
  },

  async forgotPassword(data: { email?: string; phone?: string; target?: string; role: string }): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: { email?: string; phone?: string; target?: string; otp: string; newPassword: string; role: string }): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async syncTransactions(token: string, transactions: SyncTransactionPayload[]): Promise<{ success: boolean; message?: string }[]> {
    return fetchJson<{ success: boolean; message?: string }[]>('/transactions/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ transactions }),
    });
  },
};
