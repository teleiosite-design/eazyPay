"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sterling_service_1 = require("./sterling.service");
const banking_service_1 = require("./banking.service");
const banking_controller_1 = require("./banking.controller");
const mock_banking_provider_1 = require("./providers/mock-banking.provider");
const paystack_banking_provider_1 = require("./providers/paystack-banking.provider");
const sterling_banking_provider_1 = require("./providers/sterling-banking.provider");
const user_entity_1 = require("../users/entities/user.entity");
const merchant_entity_1 = require("../merchants/entities/merchant.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
let BankingModule = class BankingModule {
};
exports.BankingModule = BankingModule;
exports.BankingModule = BankingModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, merchant_entity_1.Merchant, transaction_entity_1.Transaction])],
        controllers: [banking_controller_1.BankingController],
        providers: [
            sterling_service_1.SterlingService,
            banking_service_1.BankingService,
            mock_banking_provider_1.MockBankingProvider,
            paystack_banking_provider_1.PaystackBankingProvider,
            sterling_banking_provider_1.SterlingBankingProvider,
        ],
        exports: [banking_service_1.BankingService, sterling_service_1.SterlingService],
    })
], BankingModule);
//# sourceMappingURL=banking.module.js.map