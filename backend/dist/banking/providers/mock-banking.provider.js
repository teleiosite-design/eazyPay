"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockBankingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBankingProvider = void 0;
const common_1 = require("@nestjs/common");
let MockBankingProvider = MockBankingProvider_1 = class MockBankingProvider {
    constructor() {
        this.providerName = 'mock';
        this.logger = new common_1.Logger(MockBankingProvider_1.name);
    }
    async verifyKyc(idNumber, idType, fullName) {
        const cleanId = (idNumber || '').replace(/\D/g, '');
        if (cleanId.length !== 11) {
            throw new common_1.BadRequestException(`${idType.toUpperCase()} must be exactly 11 numeric digits under CBN regulations.`);
        }
        this.logger.log(`[MOCK KYC] Verified ${idType.toUpperCase()}: ${cleanId} for ${fullName || 'User'}`);
        return {
            valid: true,
            kycTier: 'tier2',
            verifiedName: fullName || 'Joy Adaeze',
            message: `${idType.toUpperCase()} (${cleanId}) verified successfully via NIBSS/NIMC Gateway (Mock Provider).`,
        };
    }
    async createVirtualAccount(phone, name, _email, _bvn) {
        const cleanPhone = (phone || '').replace(/\D/g, '');
        const accountSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-7) : '2837410';
        const accountNumber = `99${accountSuffix}`;
        this.logger.log(`[MOCK DVA] Generated Virtual NUBAN ${accountNumber} for ${name}`);
        return {
            accountNumber,
            accountName: `EazyPay / ${name}`,
            bankName: 'Wema Bank (EazyPay Gateway)',
            bankCode: '035',
            currency: 'NGN',
            provider: 'mock',
        };
    }
    async performNameEnquiry(accountNumber, bankCode) {
        this.logger.log(`[MOCK NUBAN ENQUIRY] Checking ${accountNumber} at Bank Code ${bankCode}`);
        return {
            accountNumber,
            accountName: 'Babcock Merchant Vendor',
            bankName: 'GTBank',
            bankCode: bankCode || '058',
            sessionRef: `MOCK-SESS-${Date.now()}`,
        };
    }
    async initiateTransfer(accountNumber, bankCode, amount, _narration) {
        const reference = `EP-NIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        this.logger.log(`[MOCK NIP TRANSFER] Sent ₦${amount} to ${accountNumber} (Ref: ${reference})`);
        return {
            success: true,
            reference,
            status: 'SUCCESS',
            message: `₦${amount} transferred successfully to account ${accountNumber}. (Mock Gateway)`,
        };
    }
    async processWebhook(payload, _signature) {
        this.logger.log(`[MOCK WEBHOOK] Processed inbound transfer event: ${JSON.stringify(payload)}`);
        return {
            success: true,
            message: 'Mock deposit webhook received and processed.',
        };
    }
};
exports.MockBankingProvider = MockBankingProvider;
exports.MockBankingProvider = MockBankingProvider = MockBankingProvider_1 = __decorate([
    (0, common_1.Injectable)()
], MockBankingProvider);
//# sourceMappingURL=mock-banking.provider.js.map