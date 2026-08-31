# EazyPay Codebase Audit

**Audit date:** 31 August 2026
**Scope:** the tracked root configuration, all 34 backend TypeScript files, all 31
mobile TypeScript/TSX files, Docker/Compose configuration, and the GitHub Actions
workflow. This is a source-code and automated-check audit, not a penetration test
or a review of a deployed environment.

## Executive assessment

EazyPay is a **working prototype/demo**, not a production-ready financial product.
It has a usable Expo customer/vendor interface and a NestJS API with local SQLite
persistence. The happy paths for registration, OTP, PIN setup, merchant login,
and authenticated P2P transfer are covered by the current backend end-to-end
suite. The proposed offline payment and banking capabilities are only partially
implemented: the mobile ledger is local, the cryptography is simulated, and the
banking gateway defaults to a mock provider.

The most important remaining work is security and money-movement correctness.
Do not process real funds, identity documents, or live banking credentials with
the current build.

## What has been achieved

### Platform and delivery foundations

* The repository is split into a NestJS backend and Expo/React Native mobile app,
  with documented local setup, a Docker build/runtime image, Docker Compose
  persistence, environment-variable examples, Swagger at `/api/docs`, and a
  backend GitHub Actions workflow.
* Backend TypeORM entities model users, merchants, and transactions. SQLite is
  wired for local persistence and transaction replay prevention has a unique
  `(customerId, nonce)` index.
* The banking layer has a provider interface plus mock, Paystack, and Sterling
  adapter classes. This is a good separation point for replacing demo behavior
  with verified provider integrations.

### Identity, accounts, and wallet flows

* Customer and merchant registration, duplicate-phone detection, bcrypt storage
  of merchant passwords and transaction PINs, JWT issuance, OTP send/verify,
  password reset, and merchant/customer profile retrieval are implemented.
* Customer P2P transfers run inside a database transaction, verify the sender's
  PIN, reject self-transfer and insufficient funds, and create a ledger row.
* The mobile app provides onboarding, registration, OTP and PIN screens plus
  customer/vendor home, pay, history, profile, support, theme, and demo screens.
  It saves a JWT and local PIN verifier with Expo SecureStore where available.

### Offline UX and local data

* The app uses `expo-sqlite` for a local transaction queue, records pending versus
  synced status, retains transactions after a failed sync request, and can mark
  individual server-accepted nonces as synced.
* An NFC service can initialize NFC, read an NDEF text record, and write a text
  record carrying `customerId|publicKey`. The app also includes an offline banner,
  receipt UI, a pseudo-QR display, and a ledger-chain integrity display.

### Checks run during this audit

* Backend build passed.
* Backend unit tests passed: 1 test.
* Backend E2E tests passed: 18 tests covering registration, duplicate detection,
  OTP success/failure, PIN setup/verification, authenticated P2P failure/success,
  merchant registration, password recovery, and merchant PIN verification.
* Backend ESLint completed successfully. Note that the command is configured with
  `--fix`, so it is not a non-mutating CI check.
* Mobile TypeScript compilation passed. There are no mobile unit, integration, or
  end-to-end test scripts in `mobile/package.json`.

## What remains

### Blockers before any real-user or real-money release

1. **Replace simulated signing with real device-bound asymmetric cryptography.**
   The mobile "key pair" is two unrelated SHA-256 strings, signing is a hash of
   a private string, and verification accepts any `SIG_` prefix. The backend also
   accepts the literal `NFC_BYPASS` signature. Use a maintained native crypto
   implementation backed by Android Keystore/iOS Secure Enclave, provision a
   valid public key, use canonical payload encoding, and delete all bypasses and
   fallback keys. Add interoperability, invalid-signature, replay, and key-loss
   tests.
2. **Close authorization and data-exposure gaps.** Registration, PIN set/verify,
   profile reads, transaction listing, and every banking endpoint are public.
   Profile entity serialization can expose PIN hashes, OTP codes/expiry, KYC
   identifiers, balances, and account data. Define roles/ownership checks;
   protect endpoints; use request/response DTOs with validation and allowlisted
   fields; never serialize credential, OTP, KYC, or secret columns.
3. **Validate every monetary request and define a ledger.** There are no DTO
   validators or positive/finite amount checks. A negative P2P or sync amount can
   invert debits and credits. Do not accept client-provided `initialBalance` in
   production. Use integer minor units or a fixed decimal type, enforce limits
   and KYC tiers, add idempotency, lock/version account rows, and record balanced,
   immutable double-entry postings with auditable states.
4. **Make authentication production-safe.** Remove universal OTPs `123456` and
   `000000`, the source fallback JWT secret, OTP console logging, and automatic
   creation of "Pending" users/merchants in OTP sending. Require startup secrets,
   rate-limit and lock down login/OTP/PIN endpoints, add session revocation and
   password/PIN policy, and distinguish email verification from phone verification.
5. **Treat banking integrations as unimplemented until provider-grade flows are
   complete.** The default is mock; Paystack fallbacks report success on failures
   and its transfer implementation does not call Paystack; the controller accepts
   unauthenticated transfer and webhook requests; webhook signatures are not
   verified. Implement actual provider APIs, provider-specific request validation,
   signed raw-body webhook verification, reconciliation, payout state machines,
   idempotency, and a sandbox-to-production configuration gate.
6. **Fix transport and deployment safety.** Mobile uses hard-coded HTTP localhost/
   Android-emulator addresses. Introduce build-time environment configuration and
   HTTPS-only API URLs, certificate/network policy, CORS/helmet/security headers,
   request size limits, structured redacted logs, health/readiness endpoints,
   production migrations, backups, and monitoring. Remove `synchronize: true`.

### Important functional work

* **Make NFC card handling real.** `writeAndLockCard` writes NDEF only; it does
  not set an NTAG password or memory protection despite its name/comment. Define
  card issuance, key diversification, secure read/write permissions, revocation,
  loss replacement, and device/card binding. Verify tag/customer ownership at
  the terminal before creating a payment.
* **Reconcile mobile and server payment semantics.** The mobile payment flow
  immediately changes UI balances and inserts a general local record, but does
  not construct the server's signed payload when it is created. Sync later uses
  an arbitrary/random nonce if one is absent and sends a local signature whose
  payload format differs from the backend verifier. Create one versioned payment
  command at authorization time and persist its exact payload, nonce, signature,
  idempotency key, payer/vendor IDs, and lifecycle state.
* **Make the local ledger tamper-resistant or describe it honestly.** SQLite is
  not encrypted in this Expo implementation; the chain hashes only selected
  fields; the UI's tamper/repair actions only flip in-memory status. Decide
  whether it is a UX queue or a security control. If security control is needed,
  use encrypted storage and a server-verifiable signed append-only receipt chain.
* **Finish app persistence and real device behavior.** Registration/session state,
  role, profiles, cards, disputes, biometrics, balances, and support messages are
  largely React in-memory state. Biometric status/toggle and support replies are
  simulated. Implement actual LocalAuthentication, durable encrypted state,
  logout, token refresh/expiry handling, error/offline recovery, accessibility,
  and device testing.
* **Implement compliance and operations.** Add consent/privacy notices and data
  retention/deletion, KYC provider verification rather than success defaults,
  anti-fraud limits, dispute case management and audit trails, merchant
  onboarding/settlement approval, reconciliations, incident response, and the
  regulatory/legal review appropriate to the target market.

### Engineering quality work

* Add class-validator DTOs and a global validation pipe; document a versioned API
  contract and generate/maintain OpenAPI schemas.
* Expand automated coverage to authorization, redaction, negative/zero/NaN/large
  amounts, concurrent transfers, transaction sync, duplicate/replayed/nonced
  payments, signature failures, provider webhook verification, migrations, and
  all mobile services/screens. Add mobile lint, tests, and E2E/device checks to
  CI; make lint non-mutating.
* Replace the stale `backend/README.md`, which describes a different Android
  Room/SQLCipher application and includes an apparent database password, with
  accurate backend operations and security documentation.
* Add dependency/security scanning, secret scanning, release/versioning policy,
  mobile build signing/OTA update controls, observability, performance/load tests,
  backup restore drills, and documented disaster recovery.

## Recommended delivery order

1. Freeze real-money rollout; remove bypasses and exposed secrets; add endpoint
   authorization, DTO validation, response redaction, and monetary invariants.
2. Redesign the payment protocol and ledger; implement genuine device keys,
   signatures, secure NFC issuance, offline limits, and robust idempotent sync.
3. Complete provider integrations and webhook/reconciliation workflows in sandbox;
   add migration-based production data management and secure deployment controls.
4. Build the automated test pyramid and CI gates, then conduct independent mobile,
   API, cryptographic, and infrastructure security reviews before a pilot.
5. Run a limited, monitored pilot only after compliance, operational support,
   incident response, and reconciliation processes are proven.

## Audit limitations

This review did not exercise NFC hardware, a real email service, real bank
providers, Docker Compose runtime, a physical mobile device, production secrets,
or a deployed API. Passing automated checks only establishes the currently tested
prototype paths; it does not validate the security or readiness claims above.
