export declare class Merchant {
    id: string;
    name: string;
    phone: string;
    passwordHash: string;
    balance: number;
    transactionPinHash: string;
    isPhoneVerified: boolean;
    otpCode: string;
    otpExpiry: Date;
}
