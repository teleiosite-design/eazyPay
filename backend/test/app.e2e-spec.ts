import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Merchant } from '../src/merchants/entities/merchant.entity';

describe('EazyPay Backend Auth & Registration (e2e)', () => {
  let app: INestApplication;

  let userRepo: Repository<User>;
  let merchantRepo: Repository<Merchant>;

  beforeAll(async () => {
    const dbPath = path.join(process.cwd(), 'eazypay.sqlite');
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch (err) {
        console.warn('Could not delete SQLite test database:', err);
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    merchantRepo = moduleFixture.get<Repository<Merchant>>(
      getRepositoryToken(Merchant),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const testUserPhone = '8012345678';
  const testMerchantPhone = '8098765432';

  describe('/users/register', () => {
    it('should register a new customer account successfully', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Jane Doe',
          phone: testUserPhone,
          publicKeyBase64: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE234234234...',
          initialBalance: 5000.0,
        })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Jane Doe');
          expect(res.body.phone).toBe(testUserPhone);
          expect(res.body.balance).toBe(5000.0);
          expect(res.body.isPhoneVerified).toBe(false);
        });
    });

    it('should reject duplicate customer registrations', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Another User',
          phone: testUserPhone,
          publicKeyBase64: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
        })
        .expect(409);
    });
  });

  describe('/auth/send-otp & /auth/verify-otp', () => {
    let activeOtp = '';

    it('should generate and return a 6-digit OTP code for customer verification', () => {
      return request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({
          phone: testUserPhone,
          role: 'customer',
        })
        .expect(200)
        .then(async (res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.otpCode).toBeUndefined();
          // Fetch OTP directly from DB for test assertion
          const user = await userRepo.findOne({
            where: { phone: testUserPhone },
          });
          expect(user).toBeDefined();
          expect(user.otpCode).toBeDefined();
          expect(user.otpCode.length).toBe(6);
          activeOtp = user.otpCode;
        });
    });

    it('should successfully verify the phone number with the correct OTP', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phone: testUserPhone,
          otp: activeOtp,
          role: 'customer',
        })
        .expect(200)
        .then((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should reject invalid or expired OTP codes', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phone: testUserPhone,
          otp: '999999', // wrong OTP
          role: 'customer',
        })
        .expect(400); // BadRequestException
    });
  });

  describe('/users/set-pin & /users/verify-pin', () => {
    it('should configure a 4-digit transaction PIN successfully', () => {
      return request(app.getHttpServer())
        .post('/users/set-pin')
        .send({
          phone: testUserPhone,
          pin: '4321',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should reject non-4-digit transaction PIN configurations', () => {
      return request(app.getHttpServer())
        .post('/users/set-pin')
        .send({
          phone: testUserPhone,
          pin: '12345', // invalid length
        })
        .expect(400);
    });

    it('should successfully verify a matching transaction PIN', () => {
      return request(app.getHttpServer())
        .post('/users/verify-pin')
        .send({
          phone: testUserPhone,
          pin: '4321',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.isMatch).toBe(true);
        });
    });

    it('should reject a mismatched transaction PIN', () => {
      return request(app.getHttpServer())
        .post('/users/verify-pin')
        .send({
          phone: testUserPhone,
          pin: '0000', // wrong PIN
        })
        .expect(201)
        .then((res) => {
          expect(res.body.isMatch).toBe(false);
        });
    });
  });

  describe('P2P Transfers - /users/transfer', () => {
    const testRecipientPhone = '8055556666';
    let senderToken = '';

    beforeAll(async () => {
      // Register a recipient customer account
      await request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Bob Smith',
          phone: testRecipientPhone,
          publicKeyBase64: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE999999...',
          initialBalance: 1000.0,
        })
        .expect(201);

      // Authenticate the sender (testUserPhone) to get their token
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: testUserPhone,
          password: '4321', // PIN set earlier
        })
        .expect(200)
        .then((res) => {
          senderToken = res.body.accessToken;
        });
    });

    it('should fail transfer with incorrect transaction PIN', () => {
      return request(app.getHttpServer())
        .post('/users/transfer')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientPhone: testRecipientPhone,
          amount: 500.0,
          pin: '9999', // wrong PIN
        })
        .expect(400);
    });

    it('should fail transfer if sender balance is insufficient', () => {
      return request(app.getHttpServer())
        .post('/users/transfer')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientPhone: testRecipientPhone,
          amount: 999999.0, // excessive amount
          pin: '4321',
        })
        .expect(400);
    });

    it('should complete transfer successfully when authorized', () => {
      return request(app.getHttpServer())
        .post('/users/transfer')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientPhone: testRecipientPhone,
          amount: 1500.0,
          pin: '4321',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('Successfully transferred');
        });
    });

    it('should verify sender balance was deducted and recipient credited', async () => {
      // Set PIN for recipient
      await request(app.getHttpServer())
        .post('/users/set-pin')
        .send({
          phone: testRecipientPhone,
          pin: '5555',
        })
        .expect(201);

      // Log in recipient
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: testRecipientPhone,
          password: '5555',
        })
        .expect(200)
        .then((res) => {
          expect(res.body.customer.balance).toBe(2500.0);
        });

      // Log in sender
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: testUserPhone,
          password: '4321',
        })
        .expect(200)
        .then((res) => {
          expect(res.body.customer.balance).toBe(3500.0);
        });
    });
  });

  describe('/merchants/register & password recovery', () => {
    let recoveryOtp = '';

    it('should register a new merchant successfully', () => {
      return request(app.getHttpServer())
        .post('/merchants/register')
        .send({
          name: 'Campus Cafeteria',
          phone: testMerchantPhone,
          password: 'secure_password_123',
          initialBalance: 0.0,
        })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Campus Cafeteria');
          expect(res.body.phone).toBe(testMerchantPhone);
          expect(res.body.passwordHash).toBeUndefined(); // verify field is hidden
        });
    });

    it('should initiate forgot-password OTP generation successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          phone: testMerchantPhone,
          role: 'merchant',
        })
        .expect(200)
        .then(async (res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.otpCode).toBeUndefined();
          // Fetch OTP from DB
          const merchant = await merchantRepo.findOne({
            where: { phone: testMerchantPhone },
          });
          expect(merchant).toBeDefined();
          expect(merchant.otpCode).toBeDefined();
          expect(merchant.otpCode.length).toBe(6);
          recoveryOtp = merchant.otpCode;
        });
    });

    it('should successfully reset merchant password with recovery OTP and authenticate with new credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          phone: testMerchantPhone,
          otp: recoveryOtp,
          newPassword: 'my_brand_new_password_2026',
          role: 'merchant',
        })
        .expect(200)
        .then(() => {
          // Log in with new password
          return request(app.getHttpServer())
            .post('/auth/login')
            .send({
              phone: testMerchantPhone,
              password: 'my_brand_new_password_2026',
            })
            .expect(200)
            .then((loginRes) => {
              expect(loginRes.body.accessToken).toBeDefined();
              expect(loginRes.body.merchant.phone).toBe(testMerchantPhone);
            });
        });
    });

    it('should configure a 4-digit merchant transaction passcode successfully', () => {
      return request(app.getHttpServer())
        .post('/merchants/set-pin')
        .send({
          phone: testMerchantPhone,
          pin: '8888',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should successfully verify a matching merchant passcode PIN', () => {
      return request(app.getHttpServer())
        .post('/merchants/verify-pin')
        .send({
          phone: testMerchantPhone,
          pin: '8888',
        })
        .expect(201)
        .then((res) => {
          expect(res.body.isMatch).toBe(true);
        });
    });
  });
});
