import { UsersService } from './users.service';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(name: string, phone: string, publicKeyBase64: string, initialBalance?: number): Promise<User>;
    findOne(id: string): Promise<User>;
    setTransactionPin(phone: string, pin: string): Promise<{
        success: boolean;
    }>;
    verifyTransactionPin(phone: string, pin: string): Promise<{
        isMatch: boolean;
    }>;
    transfer(req: any, recipientPhone: string, amount: number, pin: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
