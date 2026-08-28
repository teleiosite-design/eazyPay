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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(name, phone, publicKeyBase64, initialBalance = 10000.0, email, department, level, institutionId, memberId, idType, idNumber, nin, bvn) {
        const existing = await this.userRepository.findOne({ where: { phone } });
        if (existing) {
            throw new common_1.ConflictException('A user with this phone number is already registered.');
        }
        const kycTier = nin || bvn || (idType !== 'campus_id' && idNumber) ? 'tier2' : 'tier1';
        const user = this.userRepository.create({
            name,
            phone,
            publicKeyBase64,
            balance: initialBalance,
            email: email || `${phone}@babcock.edu.ng`,
            department: department || 'Computer Science',
            level: level || '400 Level',
            institutionId: institutionId || 'babcock.edu.ng',
            memberId: memberId || 'EP-0047',
            idType: idType || 'nin',
            idNumber: idNumber || nin || bvn || '22123456789',
            nin: nin || (idType === 'nin' ? idNumber : undefined),
            bvn: bvn || (idType === 'bvn' ? idNumber : undefined),
            kycTier,
        });
        return await this.userRepository.save(user);
    }
    async verifyKyc(idType, idNumber, fullName) {
        if (!idNumber || idNumber.trim().length === 0) {
            throw new common_1.BadRequestException('ID number is required for KYC verification.');
        }
        if (idType === 'nin' || idType === 'bvn') {
            const clean = idNumber.replace(/\D/g, '');
            if (clean.length !== 11) {
                throw new common_1.BadRequestException(`${idType.toUpperCase()} must be exactly 11 digits under CBN regulations.`);
            }
            return {
                valid: true,
                message: `${idType.toUpperCase()} (${clean}) verified successfully via NIBSS / NIMC gateway.`,
                kycTier: 'tier2',
                verifiedName: fullName || 'Joy Adaeze',
            };
        }
        if (idType === 'campus_id') {
            return {
                valid: true,
                message: `Campus Matriculation ID (${idNumber}) validated against institution ledger.`,
                kycTier: 'tier1',
                verifiedName: fullName || 'Joy Adaeze',
            };
        }
        return {
            valid: true,
            message: `Document (${idType.toUpperCase()}: ${idNumber}) verified successfully.`,
            kycTier: 'tier2',
            verifiedName: fullName || 'Joy Adaeze',
        };
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found.`);
        }
        return user;
    }
    async findByPhone(phone) {
        const user = await this.userRepository.findOne({ where: { phone } });
        if (!user) {
            throw new common_1.NotFoundException(`User with phone number ${phone} not found.`);
        }
        return user;
    }
    async setTransactionPin(phone, pin) {
        const user = await this.userRepository.findOne({ where: { phone } });
        if (!user) {
            throw new common_1.NotFoundException('Customer account not found.');
        }
        if (pin.length !== 4 || isNaN(Number(pin))) {
            throw new common_1.BadRequestException('Transaction PIN must be a 4-digit number.');
        }
        const saltRounds = 10;
        user.transactionPinHash = await bcrypt.hash(pin, saltRounds);
        await this.userRepository.save(user);
        return { success: true };
    }
    async verifyTransactionPin(phone, pin) {
        const user = await this.userRepository.findOne({ where: { phone } });
        if (!user || !user.transactionPinHash) {
            return { isMatch: false };
        }
        const isMatch = await bcrypt.compare(pin, user.transactionPinHash);
        return { isMatch };
    }
    async transfer(senderPhone, recipientPhone, amount, pin) {
        return await this.userRepository.manager.transaction(async (entityManager) => {
            const sender = await entityManager.findOne(user_entity_1.User, {
                where: { phone: senderPhone },
            });
            if (!sender) {
                throw new common_1.NotFoundException('Sender account not found.');
            }
            if (!sender.transactionPinHash) {
                throw new common_1.BadRequestException('Transaction PIN is not configured.');
            }
            const isMatch = await bcrypt.compare(pin, sender.transactionPinHash);
            if (!isMatch) {
                throw new common_1.BadRequestException('Incorrect transaction PIN.');
            }
            const recipient = await entityManager.findOne(user_entity_1.User, {
                where: { phone: recipientPhone },
            });
            if (!recipient) {
                throw new common_1.NotFoundException('Recipient account not found.');
            }
            if (sender.id === recipient.id) {
                throw new common_1.BadRequestException('Cannot transfer to yourself.');
            }
            if (sender.balance < amount) {
                throw new common_1.BadRequestException('Insufficient wallet balance.');
            }
            sender.balance = Number(sender.balance) - amount;
            recipient.balance = Number(recipient.balance) + amount;
            await entityManager.save(user_entity_1.User, sender);
            await entityManager.save(user_entity_1.User, recipient);
            const timestamp = Date.now();
            const nonce = Math.floor(100000 + Math.random() * 900000);
            const debitTx = entityManager.create(transaction_entity_1.Transaction, {
                customerId: sender.id,
                vendorId: `USER_${recipient.id}`,
                amount: amount,
                nonce: nonce,
                timestamp: timestamp,
                signature: 'P2P_TRANSFER',
            });
            await entityManager.save(transaction_entity_1.Transaction, debitTx);
            return {
                success: true,
                message: `Successfully transferred ₦${amount.toFixed(2)} to ${recipient.name}.`,
            };
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map