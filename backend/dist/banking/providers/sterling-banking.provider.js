"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SterlingBankingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SterlingBankingProvider = void 0;
const common_1 = require("@nestjs/common");
const sterling_service_1 = require("../sterling.service");
let SterlingBankingProvider = SterlingBankingProvider_1 = class SterlingBankingProvider {
    constructor(sterlingService) {
        this.sterlingService = sterlingService;
        this.providerName = 'sterling';
        this.logger = new common_1.Logger(SterlingBankingProvider_1.name);
    }
    async verifyKyc(idNumber, idType, fullName) {
        const res = await this.sterlingService.verifyKycWithSterling(idNumber, idType, fullName);
        return {
            valid: res.valid,
            kycTier: res.kycTier,
            verifiedName: res.verifiedName || fullName || 'User',
            message: res.message,
        };
    }
    async createVirtualAccount(phone, name, email, bvn) {
        const res = await this.sterlingService.generateVirtualAccount(phone, name, bvn);
        return {
            accountNumber: res.accountNumber,
            accountName: res.accountName,
            bankName: res.bankName,
            bankCode: res.bankCode,
            currency: res.currency,
            provider: 'sterling',
        };
    }
    async performNameEnquiry(accountNumber, bankCode) {
        const res = await this.sterlingService.performNameEnquiry(accountNumber, bankCode);
        return {
            accountNumber: res.accountNumber,
            accountName: res.accountName,
            bankName: res.bankName,
            bankCode: res.bankCode,
        };
    }
    async initiateTransfer(accountNumber, bankCode, amount, narration) {
        const res = await this.sterlingService.initiateNipTransfer(accountNumber, bankCode, amount, narration);
        return {
            success: res.success,
            reference: res.reference,
            status: res.success ? 'SUCCESS' : 'FAILED',
            message: res.message,
        };
    }
    async processWebhook(payload, signature) {
        return await this.sterlingService.processWebhook(payload, signature);
    }
};
exports.SterlingBankingProvider = SterlingBankingProvider;
exports.SterlingBankingProvider = SterlingBankingProvider = SterlingBankingProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sterling_service_1.SterlingService])
], SterlingBankingProvider);
//# sourceMappingURL=sterling-banking.provider.js.map