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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const merchant_entity_1 = require("../merchants/entities/merchant.entity");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userRepository, merchantRepository, jwtService) {
        this.userRepository = userRepository;
        this.merchantRepository = merchantRepository;
        this.jwtService = jwtService;
    }
    async validateMerchant(phone, passwordPlain) {
        const merchant = await this.merchantRepository.findOne({
            where: { phone },
        });
        if (merchant) {
            const isPasswordMatching = await bcrypt.compare(passwordPlain, merchant.passwordHash);
            if (isPasswordMatching) {
                const result = { ...merchant };
                delete result.passwordHash;
                return { ...result, role: 'merchant' };
            }
        }
        const customer = await this.userRepository.findOne({
            where: { phone },
        });
        if (customer && customer.transactionPinHash) {
            const isPinMatching = await bcrypt.compare(passwordPlain, customer.transactionPinHash);
            if (isPinMatching) {
                const result = { ...customer };
                delete result.transactionPinHash;
                return { ...result, role: 'customer' };
            }
        }
        throw new common_1.UnauthorizedException('Invalid phone number or passcode.');
    }
    async login(user) {
        const payload = {
            sub: user.id,
            phone: user.phone,
            name: user.name,
        };
        const isMerchant = user.role === 'merchant';
        return {
            accessToken: this.jwtService.sign(payload),
            [isMerchant ? 'merchant' : 'customer']: user,
        };
    }
    async sendOtp(phone, role) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60000);
        if (role === 'customer') {
            const user = await this.userRepository.findOne({ where: { phone } });
            if (!user)
                throw new common_1.NotFoundException('No customer account found with this phone number.');
            user.otpCode = otpCode;
            user.otpExpiry = otpExpiry;
            await this.userRepository.save(user);
        }
        else {
            const merchant = await this.merchantRepository.findOne({
                where: { phone },
            });
            if (!merchant)
                throw new common_1.NotFoundException('No merchant account found with this phone number.');
            merchant.otpCode = otpCode;
            merchant.otpExpiry = otpExpiry;
            await this.merchantRepository.save(merchant);
        }
        console.log(`[FINTECH OTP SMS] Sent to ${phone}: Code ${otpCode}`);
        return { success: true, otpCode };
    }
    async verifyOtp(phone, otp, role) {
        if (role === 'customer') {
            const user = await this.userRepository.findOne({ where: { phone } });
            if (!user)
                throw new common_1.NotFoundException('User not found.');
            if (!user.otpCode ||
                user.otpCode !== otp ||
                !user.otpExpiry ||
                user.otpExpiry < new Date()) {
                throw new common_1.BadRequestException('Invalid or expired OTP code.');
            }
            user.isPhoneVerified = true;
            user.otpCode = null;
            user.otpExpiry = null;
            await this.userRepository.save(user);
        }
        else {
            const merchant = await this.merchantRepository.findOne({
                where: { phone },
            });
            if (!merchant)
                throw new common_1.NotFoundException('Merchant not found.');
            if (!merchant.otpCode ||
                merchant.otpCode !== otp ||
                !merchant.otpExpiry ||
                merchant.otpExpiry < new Date()) {
                throw new common_1.BadRequestException('Invalid or expired OTP code.');
            }
            merchant.isPhoneVerified = true;
            merchant.otpCode = null;
            merchant.otpExpiry = null;
            await this.merchantRepository.save(merchant);
        }
        return { success: true };
    }
    async forgotPassword(phone, role) {
        return await this.sendOtp(phone, role);
    }
    async resetPassword(phone, otp, newPasswordPlain, role) {
        await this.verifyOtp(phone, otp, role);
        if (role === 'customer') {
            throw new common_1.BadRequestException('Customers reset their login using transaction PIN settings.');
        }
        else {
            const merchant = await this.merchantRepository.findOne({
                where: { phone },
            });
            if (!merchant)
                throw new common_1.NotFoundException('Merchant not found.');
            const saltRounds = 10;
            merchant.passwordHash = await bcrypt.hash(newPasswordPlain, saltRounds);
            await this.merchantRepository.save(merchant);
        }
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map