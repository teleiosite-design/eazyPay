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
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_entity_1 = require("./entities/merchant.entity");
const bcrypt = require("bcrypt");
let MerchantsService = class MerchantsService {
    constructor(merchantRepository) {
        this.merchantRepository = merchantRepository;
    }
    async register(name, phone, passwordPlain, initialBalance = 0.0) {
        const existing = await this.merchantRepository.findOne({
            where: { phone },
        });
        if (existing) {
            throw new common_1.ConflictException('A merchant with this phone number is already registered.');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);
        const merchant = this.merchantRepository.create({
            name,
            phone,
            passwordHash,
            balance: initialBalance,
        });
        const saved = await this.merchantRepository.save(merchant);
        delete saved.passwordHash;
        return saved;
    }
    async findOne(id) {
        const merchant = await this.merchantRepository.findOne({ where: { id } });
        if (!merchant) {
            throw new common_1.NotFoundException(`Merchant with ID ${id} not found.`);
        }
        return merchant;
    }
    async findByPhone(phone) {
        const merchant = await this.merchantRepository.findOne({
            where: { phone },
        });
        if (!merchant) {
            throw new common_1.NotFoundException(`Merchant with phone ${phone} not found.`);
        }
        return merchant;
    }
    async setTransactionPin(phone, pin) {
        const merchant = await this.merchantRepository.findOne({ where: { phone } });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant account not found.');
        }
        if (pin.length !== 4 || isNaN(Number(pin))) {
            throw new common_1.BadRequestException('Transaction PIN must be a 4-digit number.');
        }
        const saltRounds = 10;
        merchant.transactionPinHash = await bcrypt.hash(pin, saltRounds);
        await this.merchantRepository.save(merchant);
        return { success: true };
    }
    async verifyTransactionPin(phone, pin) {
        const merchant = await this.merchantRepository.findOne({ where: { phone } });
        if (!merchant || !merchant.transactionPinHash) {
            return { isMatch: false };
        }
        const isMatch = await bcrypt.compare(pin, merchant.transactionPinHash);
        return { isMatch };
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map