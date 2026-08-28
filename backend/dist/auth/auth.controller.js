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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(phone, email, passwordPlain) {
        const identifier = email || phone || '';
        const validatedMerchant = await this.authService.validateMerchant(identifier, passwordPlain || '');
        return await this.authService.login(validatedMerchant);
    }
    async sendOtp(phone, email, targetInput, role = 'customer') {
        const target = email || targetInput || phone || '';
        return await this.authService.sendOtp(target, role, email);
    }
    async verifyOtp(phone, email, targetInput, otp = '', role = 'customer') {
        const target = email || targetInput || phone || '';
        return await this.authService.verifyOtp(target, otp, role);
    }
    async forgotPassword(phone, email, targetInput, role = 'customer') {
        const target = email || targetInput || phone || '';
        return await this.authService.forgotPassword(target, role);
    }
    async resetPassword(phone, email, targetInput, otp = '', newPasswordPlain = '', role = 'customer') {
        const target = email || targetInput || phone || '';
        return await this.authService.resetPassword(target, otp, newPasswordPlain, role);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('target')),
    __param(3, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('target')),
    __param(3, (0, common_1.Body)('otp')),
    __param(4, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('target')),
    __param(3, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('phone')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('target')),
    __param(3, (0, common_1.Body)('otp')),
    __param(4, (0, common_1.Body)('newPassword')),
    __param(5, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map