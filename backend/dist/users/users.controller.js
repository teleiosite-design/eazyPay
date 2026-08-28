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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(name, phone, publicKeyBase64, initialBalance, email, department, level, institutionId, memberId, idType, idNumber, nin, bvn) {
        return await this.usersService.register(name, phone, publicKeyBase64, initialBalance, email, department, level, institutionId, memberId, idType, idNumber, nin, bvn);
    }
    async verifyKyc(idType, idNumber, fullName) {
        return await this.usersService.verifyKyc(idType, idNumber, fullName);
    }
    async findOne(id) {
        return await this.usersService.findOne(id);
    }
    async setTransactionPin(phone, pin) {
        return await this.usersService.setTransactionPin(phone, pin);
    }
    async verifyTransactionPin(phone, pin) {
        return await this.usersService.verifyTransactionPin(phone, pin);
    }
    async transfer(req, recipientPhone, amount, pin) {
        const senderPhone = req.user.phone;
        return await this.usersService.transfer(senderPhone, recipientPhone, amount, pin);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('phone')),
    __param(2, (0, common_1.Body)('publicKeyBase64')),
    __param(3, (0, common_1.Body)('initialBalance')),
    __param(4, (0, common_1.Body)('email')),
    __param(5, (0, common_1.Body)('department')),
    __param(6, (0, common_1.Body)('level')),
    __param(7, (0, common_1.Body)('institutionId')),
    __param(8, (0, common_1.Body)('memberId')),
    __param(9, (0, common_1.Body)('idType')),
    __param(10, (0, common_1.Body)('idNumber')),
    __param(11, (0, common_1.Body)('nin')),
    __param(12, (0, common_1.Body)('bvn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-kyc'),
    __param(0, (0, common_1.Body)('idType')),
    __param(1, (0, common_1.Body)('idNumber')),
    __param(2, (0, common_1.Body)('fullName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyKyc", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('set-pin'),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setTransactionPin", null);
__decorate([
    (0, common_1.Post)('verify-pin'),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyTransactionPin", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('recipientPhone')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "transfer", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map