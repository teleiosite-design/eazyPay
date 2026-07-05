import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    register(name: string, phone: string, publicKeyBase64: string, initialBalance?: number): Promise<User>;
    findOne(id: string): Promise<User>;
    findByPhone(phone: string): Promise<User>;
    setTransactionPin(phone: string, pin: string): Promise<{
        success: boolean;
    }>;
    verifyTransactionPin(phone: string, pin: string): Promise<{
        isMatch: boolean;
    }>;
    transfer(senderPhone: string, recipientPhone: string, amount: number, pin: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
