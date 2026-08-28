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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingController = void 0;
const common_1 = require("@nestjs/common");
const banking_service_1 = require("./banking.service");
let BankingController = class BankingController {
    constructor(bankingService) {
        this.bankingService = bankingService;
    }
    getActiveProvider() {
        return {
            provider: this.bankingService.getActiveProvider().providerName,
            status: 'active',
        };
    }
    async verifyKyc(idNumber, idType, fullName) {
        return await this.bankingService.verifyKyc(idNumber, idType, fullName);
    }
    async generateVirtualAccount(phone, name, email, bvn) {
        return await this.bankingService.createVirtualAccount(phone, name, email, bvn);
    }
    async nameEnquiry(accountNumber, bankCode) {
        return await this.bankingService.performNameEnquiry(accountNumber, bankCode);
    }
    async initiateTransfer(accountNumber, bankCode, amount, narration) {
        return await this.bankingService.initiateTransfer(accountNumber, bankCode, amount, narration);
    }
    async processWebhook(payload, signature) {
        return await this.bankingService.processWebhook(payload, signature);
    }
};
exports.BankingController = BankingController;
__decorate([
    (0, common_1.Get)('active-provider'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getActiveProvider", null);
__decorate([
    (0, common_1.Post)('kyc-verify'),
    (0, common_1.Post)('sterling/kyc-verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('idNumber')),
    __param(1, (0, common_1.Body)('idType')),
    __param(2, (0, common_1.Body)('fullName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "verifyKyc", null);
__decorate([
    (0, common_1.Post)('virtual-account'),
    (0, common_1.Post)('sterling/virtual-account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('email')),
    __param(3, (0, common_1.Body)('bvn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "generateVirtualAccount", null);
__decorate([
    (0, common_1.Post)('name-enquiry'),
    (0, common_1.Post)('sterling/name-enquiry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('accountNumber')),
    __param(1, (0, common_1.Body)('bankCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "nameEnquiry", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.Post)('sterling/transfer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('accountNumber')),
    __param(1, (0, common_1.Body)('bankCode')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, common_1.Body)('narration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "initiateTransfer", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.Post)('sterling/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "processWebhook", null);
exports.BankingController = BankingController = __decorate([
    (0, common_1.Controller)('banking'),
    __metadata("design:paramtypes", [banking_service_1.BankingService])
], BankingController);
//# sourceMappingURL=banking.controller.js.map