# EazyPay

EazyPay is a campus-focused digital wallet and offline tap-to-pay system. It lets students and vendors on a university campus (modeled here on Babcock University) pay each other by tapping an NFC card/phone, even without an internet connection, with transactions syncing to a central ledger once connectivity returns.

The project has two parts:

- **`backend/`** — a [NestJS](https://nestjs.com/) (TypeScript) REST API that owns user/merchant accounts, authentication, wallet balances, transaction settlement, and integrations with banking partners.
- **`mobile/`** — an [Expo](https://expo.dev/) / React Native app used by both customers and vendors (merchants) to register, manage their wallet, and perform NFC tap-to-pay transactions online or offline.

---

## 1. High-Level Architecture

```
┌───────────────────────────┐        HTTPS/JSON        ┌───────────────────────────┐
│   Mobile App (Expo/RN)    │ ───────────────────────▶ │   Backend API (NestJS)    │
│  Customer & Vendor modes  │ ◀─────────────────────── │   REST + JWT auth         │
└───────────┬───────────────┘                          └─────────────┬─────────────┘
            │ NFC tap (offline capable)                               │
            │ local SQLite ledger (expo-sqlite)                       │ TypeORM
            ▼                                                        ▼
   Offline transaction queue                                 SQLite database
   (signed, hashed, queued)                                  (users, merchants,
            │                                                 transactions)
            │ background sync when online                              │
            └───────────────────────────▶ /transactions/sync ──────────┘
                                                                         │
                                                          Banking Provider Gateway
                                                     (Mock / Paystack / Sterling Bank)
```

### Backend modules (`backend/src`)
| Module | Responsibility |
|---|---|
| `auth` | Login, OTP send/verify, password reset, JWT issuing, email notifications (via Resend) |
| `users` | Customer registration, KYC tier assignment, transaction PIN, wallet-to-wallet transfer |
| `merchants` | Vendor (merchant) registration and profile |
| `transactions` | Verifies and settles offline NFC transactions synced from the mobile app (replay protection + signature check) |
| `banking` | Pluggable gateway abstraction for KYC verification, virtual account creation, name enquiry, and bank transfers (Mock, Paystack, Sterling providers) |

### Mobile app modules (`mobile/src`)
| Area | Responsibility |
|---|---|
| `screens` | Onboarding, registration, OTP, PIN setup, customer & vendor home/pay/history/profile screens |
| `services/api.ts` | Typed HTTP client for the backend REST API |
| `services/db.ts` | Local SQLite ledger of transactions for offline-first operation |
| `services/crypto.ts` | Device key management, PIN hashing, and payload signing for offline transactions |
| `services/nfc.ts` | Reads/writes NTAG213 NFC cards used to identify a customer at a vendor terminal |
| `store/AppContext.tsx` | Global app/session state |

---

## 2. Core User Flows

1. **Onboarding & KYC** — A user registers with name/phone/email and an ID number (NIN/BVN). The backend calls the active `BankingProvider` to verify the ID and assigns a `kycTier` (`tier1` limited, `tier2` full KYC).
2. **Authentication** — Login is by phone/email + password (merchants) or transaction PIN (customers). One-time passcodes (OTP) are emailed via Resend for verification and password reset. Successful login returns a JWT valid for 7 days.
3. **Card issuance** — A customer's NFC card (or phone) is written with `customerId | devicePublicKey` and can be locked with a password.
4. **Tap-to-pay (online or offline)** — At a vendor terminal, the app reads the customer's NFC tag, builds a transaction payload (`customerId | nonce | timestamp | amount`), signs it with the device's private key, and stores it in the local SQLite ledger with `syncStatus = Pending`.
5. **Sync** — When the phone regains connectivity, pending transactions are POSTed in a batch to `/transactions/sync`. The backend, inside a single DB transaction, re-verifies the signature, checks the nonce hasn't been used before (replay protection), confirms sufficient balance, then debits the customer and credits the merchant.
6. **Banking integration** — Wallet top-ups, virtual account (NUBAN) creation, name enquiry, and bank transfers are delegated to whichever `BANKING_PROVIDER` is configured (`mock`, `paystack`, or `sterling`), so the rest of the app is provider-agnostic.

---

## 3. Tech Stack

**Backend**: NestJS 10, TypeORM, better-sqlite3 (SQLite database), Passport-JWT, bcrypt, Handlebars email templates, Resend (transactional email), Jest for testing.

**Mobile**: Expo 57 / React Native 0.86, expo-sqlite (offline ledger), expo-secure-store (key storage), expo-crypto (hashing), react-native-nfc-manager (NTAG213 card read/write), React Context for state.

---

## 4. Getting Started

### Backend
```bash
cd backend
npm install
npm run start:dev      # http://localhost:3000
```
Configuration is read from `backend/.env` (JWT secret, Resend API key, active banking provider). The SQLite schema is auto-synchronized on boot (`synchronize: true`) — fine for prototyping, not for production.

### Mobile
```bash
cd mobile
npm install
npm run start           # then press a/i/w, or scan the QR code with Expo Go
```
The app points at `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000` (iOS simulator) by default — update `mobile/src/services/api.ts` to target a real device/host.

### Tests
```bash
cd backend
npm run test            # unit tests
npm run test:e2e        # end-to-end tests
npm run lint
```

---

## 5. Security Architecture

EazyPay's security model is built around **offline-first, tamper-evident transactions**:

- **Authentication**: JWT bearer tokens (`@nestjs/passport` + `passport-jwt`), signed with `JWT_SECRET`, expiring after 7 days. Passwords/PINs are hashed with `bcrypt` before storage — plaintext credentials are never persisted.
- **OTP verification**: One-time codes are generated with `crypto.randomInt`, expire after 5 minutes, and are emailed to the user for phone/email verification and password resets.
- **Offline transaction integrity**: Each offline payment is signed on-device and carries a unique `nonce`. When synced, the backend recomputes the payload, verifies the signature against the customer's stored public key, and rejects any transaction whose nonce has already been recorded — preventing replay attacks (e.g., re-submitting the same signed payment twice).
- **Atomic settlement**: Balance debits/credits and transaction inserts happen inside a single database transaction, so a failure can't leave the ledger half-updated.
- **Provider abstraction**: Real banking/KYC operations are isolated behind a `BankingProviderInterface`, so swapping or sandboxing a banking partner doesn't touch business logic.

### ⚠️ Known Gaps (Prototype-Stage)
This codebase is an early-stage prototype/demo and has security shortcuts that **must be removed before any production or real-money use**:

- `verifyEcdsaSignature` in `backend/src/transactions/transactions.service.ts` accepts a hardcoded `NFC_BYPASS` signature as always-valid — this disables signature verification entirely for any client that sends it.
- The mobile `CryptoService` (`mobile/src/services/crypto.ts`) does not perform real asymmetric (ECDSA) cryptography — "public/private keys" are random SHA-256 strings and "signatures" are hashes, not verifiable digital signatures. True EC key generation/signing (e.g., via platform Keystore/Secure Enclave) is required for genuine non-repudiation.
- `AuthService.verifyOtp` accepts universal bypass codes (`123456`, `000000`) regardless of the real OTP — this must be removed outside of local development.
- Several endpoints that expose sensitive data (e.g., `GET /transactions`, `GET /users/:id`) are not protected by `JwtAuthGuard`.
- `JWT_SECRET` has a hardcoded fallback value in source; secrets must always come from environment configuration in real deployments.
- `TypeOrmModule.forRoot({ synchronize: true })` auto-alters schema at boot — safe for prototyping only; production needs migrations.

---

## 6. Repository Layout
```
backend/   NestJS API, SQLite DB, banking provider integrations
mobile/    Expo/React Native customer & vendor app
```
