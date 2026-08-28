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
var BankingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const common_1 = require("@nestjs/common");
const mock_banking_provider_1 = require("./providers/mock-banking.provider");
const paystack_banking_provider_1 = require("./providers/paystack-banking.provider");
const sterling_banking_provider_1 = require("./providers/sterling-banking.provider");
let BankingService = BankingService_1 = class BankingService {
    constructor(mockProvider, paystackProvider, sterlingProvider) {
        this.mockProvider = mockProvider;
        this.paystackProvider = paystackProvider;
        this.sterlingProvider = sterlingProvider;
        this.logger = new common_1.Logger(BankingService_1.name);
    }
    getActiveProvider() {
        const configuredProvider = (process.env.BANKING_PROVIDER || 'mock').toLowerCase();
        switch (configuredProvider) {
            case 'paystack':
                this.logger.log(`[BANKING GATEWAY] Active Provider: PAYSTACK DVA`);
                return this.paystackProvider;
            case 'sterling':
                this.logger.log(`[BANKING GATEWAY] Active Provider: STERLING BANK BaaS`);
                return this.sterlingProvider;
            case 'mock':
            default:
                this.logger.log(`[BANKING GATEWAY] Active Provider: MOCK GATEWAY (Development / Demo Mode)`);
                return this.mockProvider;
        }
    }
    async verifyKyc(idNumber, idType, fullName) {
        return await this.getActiveProvider().verifyKyc(idNumber, idType, fullName);
    }
    async createVirtualAccount(phone, name, email, bvn) {
        return await this.getActiveProvider().createVirtualAccount(phone, name, email, bvn);
    }
    async performNameEnquiry(accountNumber, bankCode) {
        return await this.getActiveProvider().performNameEnquiry(accountNumber, bankCode);
    }
    async initiateTransfer(accountNumber, bankCode, amount, narration) {
        return await this.getActiveProvider().initiateTransfer(accountNumber, bankCode, amount, narration);
    }
    async processWebhook(payload, signature) {
        return await this.getActiveProvider().processWebhook(payload, signature);
    }
};
exports.BankingService = BankingService;
exports.BankingService = BankingService = BankingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_banking_provider_1.MockBankingProvider,
        paystack_banking_provider_1.PaystackBankingProvider,
        sterling_banking_provider_1.SterlingBankingProvider])
], BankingService);
//# sourceMappingURL=banking.service.js.map