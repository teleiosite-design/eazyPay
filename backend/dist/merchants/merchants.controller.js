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
exports.MerchantsController = void 0;
const common_1 = require("@nestjs/common");
const merchants_service_1 = require("./merchants.service");
let MerchantsController = class MerchantsController {
    constructor(merchantsService) {
        this.merchantsService = merchantsService;
    }
    async register(name, phone, passwordPlain, initialBalance, email, cacNumber, idType, idNumber, nin, bvn, bankName, accountNumber) {
        return await this.merchantsService.register(name, phone, passwordPlain, initialBalance, email, cacNumber, idType, idNumber, nin, bvn, bankName, accountNumber);
    }
    async verifyKyc(idType, idNumber, cacNumber, accountNumber) {
        return await this.merchantsService.verifyKyc(idType, idNumber, cacNumber, accountNumber);
    }
    async findOne(id) {
        return await this.merchantsService.findOne(id);
    }
    async setTransactionPin(phone, pin) {
        return await this.merchantsService.setTransactionPin(phone, pin);
    }
    async verifyTransactionPin(phone, pin) {
        return await this.merchantsService.verifyTransactionPin(phone, pin);
    }
};
exports.MerchantsController = MerchantsController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('phone')),
    __param(2, (0, common_1.Body)('password')),
    __param(3, (0, common_1.Body)('initialBalance')),
    __param(4, (0, common_1.Body)('email')),
    __param(5, (0, common_1.Body)('cacNumber')),
    __param(6, (0, common_1.Body)('idType')),
    __param(7, (0, common_1.Body)('idNumber')),
    __param(8, (0, common_1.Body)('nin')),
    __param(9, (0, common_1.Body)('bvn')),
    __param(10, (0, common_1.Body)('bankName')),
    __param(11, (0, common_1.Body)('accountNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MerchantsController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-kyc'),
    __param(0, (0, common_1.Body)('idType')),
    __param(1, (0, common_1.Body)('idNumber')),
    __param(2, (0, common_1.Body)('cacNumber')),
    __param(3, (0, common_1.Body)('accountNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MerchantsController.prototype, "verifyKyc", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('set-pin'),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MerchantsController.prototype, "setTransactionPin", null);
__decorate([
    (0, common_1.Post)('verify-pin'),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MerchantsController.prototype, "verifyTransactionPin", null);
exports.MerchantsController = MerchantsController = __decorate([
    (0, common_1.Controller)('merchants'),
    __metadata("design:paramtypes", [merchants_service_1.MerchantsService])
], MerchantsController);
//# sourceMappingURL=merchants.controller.js.map