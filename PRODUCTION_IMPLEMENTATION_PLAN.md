# EazyPay Production Implementation Plan

**Status:** planning baseline — no real-money release is permitted until the
production-readiness gate in Phase 12 passes.  This plan converts the findings in
[`AUDIT.md`](AUDIT.md) into small, agent-executable work packages. It is ordered
by dependency and risk: do not build offline payments, BLE, or live banking ahead
of the security, ledger, and operational foundations.

## 1. Target outcome and non-negotiable principles

The target is a monitored, auditable payment pilot, not merely an app that can
show a successful screen. A payment is final only after the server records
balanced ledger postings and returns a signed/authoritative outcome. If a device
or terminal is offline, it may show **pending**; it must not promise final
settlement.

### Rules every agent must preserve

1. No secret, private key, PIN, OTP, KYC value, token, balance, or account number
   appears in a log, API response, analytics event, screenshot fixture, or error.
2. All money is an integer number of minor units (for example, kobo), never a
   JavaScript floating-point value.
3. Every state-changing API has authenticated actor identity, authorization,
   validation, an idempotency key, an audit event, and tests for unauthorised use.
4. Only the backend settles money. Mobile and terminal applications may prepare,
   sign, queue, and display a payment; they cannot choose balances or final state.
5. Device and terminal private signing keys are non-exportable. JavaScript never
   receives their private key bytes.
6. Security-sensitive design decisions require review by a named security owner;
   money/ledger decisions require review by a named finance/operations owner.
7. Production configuration is fail-closed: missing required secrets, HTTPS,
   provider configuration, or migrations stop deployment rather than fall back to
   demo behavior.

## 2. Delivery model, ownership, and workflow

Create a work item for every package below. Each item must include: scope,
owner, dependencies, threat/abuse cases, data migration plan, test cases,
monitoring/alert impact, rollout/rollback plan, and acceptance evidence.

| Role | Accountable work |
|---|---|
| Product/risk owner | Limits, customer experience, pilot scope, dispute policy, approval of settlement rules |
| Backend/ledger team | API contract, auth, ledger, reconciliation, provider/webhook implementation |
| Mobile security team | Native device-key module, secure storage, app authentication, NFC/BLE UX |
| Terminal team | Terminal enrolment, merchant key protection, request/receipt protocol, connectivity |
| Platform/SRE team | Environments, CI/CD, secrets, observability, backups, incident response |
| Security/compliance owner | Threat model, penetration-test coordination, privacy/KYC review, release sign-off |
| QA team | Test strategy, device matrix, contract/E2E/load/recovery testing and evidence |

### Agent operating rules

* One agent changes one coherent package at a time; do not combine security
  refactors with UI redesigns or provider integration work in a single PR.
* Start each package by writing/approving its API schema and state transitions.
  Use versioned endpoints and additive database migrations.
* Require two reviewers for crypto, auth, money movement, provider webhooks, and
  infrastructure-as-code changes. At least one reviewer must be the accountable
  specialist above.
* Agents must not invent payment-provider requirements. Obtain them from the
  selected provider's current official sandbox documentation and record exact
  references in the implementation PR.
* A package is not complete until its automated checks are in CI, it has safe
  logs/metrics, and its acceptance criteria below are demonstrably met.

## 3. Phase 0 — freeze risk and establish the baseline

**Goal:** prevent the prototype from being mistaken for a live payment system.

1. Product owner disables real-money promotion, production credentials, and any
   public endpoint until the launch gate passes.
2. Backend agent removes all test/demo authentication and payment shortcuts:
   universal OTP values, source-code JWT fallback, `NFC_BYPASS`, mock-success
   fallbacks, and automatic account creation during OTP requests.
3. Backend agent makes all configuration environment-driven and validates it at
   application startup. Define separate `development`, `test`, `staging`, and
   `production` configs. Production must require strong JWT/session secrets,
   database URL, mail/provider credentials, allowed origins, HTTPS/public URL,
   and an explicit non-mock banking provider selection.
4. Platform agent rotates every secret that has ever been committed, removes it
   from Git history according to company policy, and enables secret scanning.
5. Documentation agent replaces stale backend operations documentation and labels
   every demo-only screen, endpoint, and mock explicitly.

**Acceptance criteria**

* A clean production start fails when any required secret/configuration is absent.
* Repository and CI secret scans pass; no live credential is committed.
* Tests prove bypass signatures, universal OTPs, and mock-success fallbacks are
  rejected in staging/production configuration.
* Product/risk owner signs a written “no real funds before Phase 12” decision.

## 4. Phase 1 — define the payment domain and immutable ledger

**Dependencies:** Phase 0.

**Goal:** decide exactly what a payment means before modifying transfer code.

1. Finance, product, and backend owners publish a versioned payment state model:
   `created`, `authorisation_pending`, `authorised`, `submitted`, `settled`,
   `declined`, `reversed`, `expired`, `disputed`, and `reconciled`. Define which
   transitions are legal, idempotent, user-visible, and reversible.
2. Define a double-entry schema: accounts, account balances/materialized views,
   journal entries, postings, holds/reserves, external references, transaction
   idempotency keys, and immutable audit events. Define debit=credit invariants
   and currency boundaries.
3. Replace `amount: number` APIs with integer `amountMinor: string` or a validated
   safe-integer representation. Publish currency, rounding, maximum amount,
   minimum amount, daily limit, merchant/category, and KYC-tier policies.
4. Implement database migrations; remove production `synchronize: true`. Include
   forward migration, rollback/repair procedure, and a migration test against a
   copy of representative data.
5. Implement one transactional server command for P2P transfer/payment creation.
   Lock or version the affected account rows, validate all invariants, write
   balanced postings and an immutable audit event in the same database transaction,
   and return a stable transaction ID.
6. Add idempotency storage keyed by authenticated actor and `Idempotency-Key`.
   Identical retries return the original safe response; conflicting reuse is
   rejected. Do not use client-provided balance as an authority.

**Acceptance criteria**

* Property/integration tests prove no successful command produces unbalanced
  postings, negative forbidden balances, duplicate settlement, or rounding loss.
* Concurrent-transfer tests demonstrate a balance cannot be spent twice.
* API contract tests reject zero, negative, fractional, `NaN`, oversized, wrong
  currency, and malformed idempotency requests.
* A finance owner reviews example journal entries for payment, failure, reversal,
  refund, and dispute.

## 5. Phase 2 — secure API, identity, and authorization

**Dependencies:** Phase 0; Phase 1 contract definitions.

1. Introduce request DTOs with `class-validator`/transformation and a global
   validation pipe that rejects unknown fields. Define separate response DTOs;
   never serialize TypeORM entities directly.
2. Design roles and ownership rules: customer, merchant user, terminal, support,
   finance operations, and administrator. Apply JWT/session guards and explicit
   ownership checks to profile, PIN, transaction, merchant, terminal, and banking
   routes. Add an authorization matrix to API documentation.
3. Redesign auth: verified phone/email identity where applicable, rate-limited OTP
   delivery/verification, single-use short-expiry OTP hashes, no OTP logging,
   password/PIN strength policy, retry lockout, secure password reset, session
   rotation/revocation, logout, device/session listing, and suspicious-login audit
   events.
4. Keep PIN verification server-side and rate-limited. Store only a suitable
   password hash; never return it. Define a PIN reset flow requiring stronger
   identity verification and audit approval.
5. Configure security headers, strict CORS allowlist, request body limits,
   secure cookies where used, TLS-only public traffic, trusted proxy settings, and
   redacted structured logging. Add health and readiness endpoints that reveal no
   sensitive operational data.

**Acceptance criteria**

* Automated authorization tests cover every route and prove cross-user,
  cross-merchant, unauthenticated, and privilege-escalation requests fail.
* Snapshot/contract tests prove responses never include hashes, OTPs, secrets,
  KYC values, full account details, or unrelated users' data.
* Rate-limit, lockout, reset, logout, expired-token, revoked-token, and refresh
  rotation E2E tests pass.
* Security review signs off the authorization matrix and threat model.

## 6. Phase 3 — device, terminal, and payment cryptography

**Dependencies:** Phases 1–2; approved protocol specification.

1. Write a protocol specification before coding. Canonically encode a versioned
   payment command containing payment ID, payer/device/key ID, merchant ID,
   terminal ID, amount minor units, currency, nonce (at least 128 random bits),
   issued time, expiry, and protocol version. Specify signature algorithm,
   encoding, key rotation/revocation, error codes, and backwards compatibility.
2. Build native mobile modules that generate ECDSA P-256 signing keys in Android
   Keystore (prefer StrongBox when available, gracefully fall back) and iOS Secure
   Enclave/Keychain. Private keys must be non-exportable; native code returns only
   public-key metadata or a signature. Require biometric/device credential based
   on the approved risk policy.
3. Build authenticated device enrolment: an authenticated customer registers a
   public key, attestation where available, device metadata, key version, and
   fingerprint. The backend binds it to the account and supports `active`,
   `rotated`, `revoked`, and `lost` lifecycle states.
4. Enrol merchant terminals similarly. Each terminal has a protected key and
   server-registered terminal/merchant binding. Do not trust a Bluetooth, Wi-Fi,
   NFC, or display name as identity.
5. Server verification accepts only canonical payloads signed by an active,
   bound key. It rejects bypasses, unknown/revoked keys, malformed signatures,
   expired requests, wrong merchant/terminal binding, duplicate nonce, and wrong
   amount/currency.
6. Define recovery: new-phone enrolment, lost device, key rotation, terminal
   replacement, revocation propagation, customer notification, cooling-off and
   support/operations approval rules.

**Acceptance criteria**

* Interoperability vectors pass on Android, iOS, backend, and terminal software.
* Tests prove an exported/private-key substitute, altered amount, altered merchant,
  reused nonce, expired command, invalid signature, revoked key, and legacy bypass
  all fail.
* Security review validates key material never reaches JavaScript, logs, backups,
  analytics, or API responses.
* A physical-device test matrix covers supported OS versions and both StrongBox
  available/unavailable Android devices.

## 7. Phase 4 — mobile application hardening

**Dependencies:** Phases 2–3.

1. Replace hard-coded HTTP/local URLs with build-time environment configuration.
   Production builds permit HTTPS API URLs only; define certificate/network policy
   and disable debug/development behavior in release builds.
2. Store only short-lived session tokens, refresh-token references, key IDs, and
   encrypted non-sensitive queue metadata in secure platform storage. Implement
   refresh, expiry, logout, server-session revocation, and safe startup recovery.
3. Replace simulated biometrics, crypto, support, and balances with server-backed
   capability checks and explicit loading/error states. Make accessibility,
   localization, privacy copy, and secure screen capture/background policy part of
   the release definition.
4. Refactor the local SQLite data into a queue only. Persist the exact canonical
   command, signature, nonce, idempotency key, payer/terminal IDs, and state; do
   not generate new values during retry. Encrypt storage if it retains material
   requiring protection. Treat any local balance as display-only.
5. Implement durable queue state: pending, submitting, accepted-pending-settlement,
   settled, declined, expired, and manual-review. Make retries backoff-aware and
   idempotent; handle app restart, network loss, duplicate response, and server
   conflict.
6. Add mobile unit tests, component tests, API-contract tests, and device E2E
   tests. Add linting and TypeScript checks to CI.

**Acceptance criteria**

* Release build contains no HTTP endpoint, demo secret, or development fallback.
* Device tests prove transactions survive force-close/restart/network loss without
  changing signed contents or creating duplicate payments.
* Screen tests accurately distinguish pending from settled and never claim offline
  settlement is final.

## 8. Phase 5 — NFC and BLE (only after online payment is safe)

**Dependencies:** Phases 3–4; successful online pilot rehearsal. This phase is
optional for the first production pilot.

1. NFC: replace plaintext `customerId|publicKey` tags with a revocable opaque
   credential/token. Define card issuance, inventory, terminal lookup, loss,
   replacement, revocation, anti-cloning strategy, and ownership checks. Do not
   describe an NDEF write as “lock” unless real tag protection is configured and
   tested.
2. BLE: use terminal as advertiser and customer app as intentional scanner/central.
   Advertise only a rotating opaque session identifier. Do not continuously
   advertise customer credentials, balances, public keys, or identities.
3. On connection, perform the application protocol from Phase 3: terminal-signed
   short-lived challenge; customer verification and visible amount confirmation;
   protected customer signature; signed terminal receipt. BLE link encryption is
   additional transport protection, not payment authorization.
4. Add timeouts, message-order rules, duplicate handling, reconnect recovery,
   terminal receipt persistence, and telemetry that contains no payment secrets.
   Threat-model relay attacks; reduce risk with NFC-assisted initiation, short
   expiry, verified terminal identity, explicit confirmation, and limits.
5. Offline acceptance must be separately approved. Define per-transaction and
   cumulative exposure limits, terminal risk rules, signed receipt chains, key
   cache/revocation strategy, delayed settlement, reconciliation, and losses. A
   pilot must display all offline payments as pending until verified.

**Acceptance criteria**

* Physical device/terminal tests cover disconnect, retry, replay, relay simulation,
  stale advertising, wrong terminal, duplicate message, and offline recovery.
* Privacy review confirms advertisements disclose no customer/payment data.
* Security/risk owners explicitly approve offline exposure limits before enabling
  offline acceptance for any cohort.

## 9. Phase 6 — banking providers, webhooks, and reconciliation

**Dependencies:** Phases 1–2; ledger foundation.

1. Select one provider and implement sandbox flows completely before a second
   provider. Remove provider methods that pretend success on error. Keep the mock
   provider test-only and block it in production.
2. Define provider-specific payout/transfer states and map them to EazyPay ledger
   states. Record provider references, attempts, raw event hashes, timestamps,
   and idempotency keys. Never use a client request alone as proof of a payout.
3. Verify webhooks using the provider's documented signature scheme against the
   raw request body, timestamp/replay controls, and configured secret. Authenticate
   all banking control APIs and restrict operations roles.
4. Build asynchronous job processing with retry/backoff, dead-letter queue,
   reconciliation scheduler, manual exception queue, and operations dashboard.
   Reconcile provider reports to internal journal entries daily (or tighter if
   required); investigate every unmatched item.
5. Add sandbox test accounts and automated tests for success, decline, timeout,
   duplicate webhook, altered signature, out-of-order event, provider outage,
   replay, reversal, and reconciliation mismatch.

**Acceptance criteria**

* Provider sandbox certification/evidence is complete.
* No webhook can change money state without a valid signature and idempotent event
  record.
* Daily reconciliation produces an auditable zero-unexplained-difference report,
  or opens a tracked exception with owner and SLA.

## 10. Phase 7 — compliance, fraud, support, and operations

**Dependencies:** Phases 1–6.

1. Obtain jurisdiction-specific legal, payment, privacy, AML/KYC, consumer
   protection, and data-residency advice. This is a business/legal workstream, not
   an AI-agent decision. Record approved markets, licences/partners, prohibited
   uses, retention periods, and launch constraints.
2. Integrate a real KYC/identity provider only after privacy and vendor assessment.
   Define KYC tiers, sanctions/AML screening where required, document handling,
   consent, retention/deletion, and manual-review access controls.
3. Implement risk controls: velocity/amount limits, new-device/merchant controls,
   geographic/device anomaly signals, deny/allow rules, case queues, and human
   review. Ensure automated decisions are explainable/auditable as legally needed.
4. Build support/dispute/refund workflows. Preserve immutable evidence: commands,
   signatures, receipts, ledger entries, provider events, operator actions, and
   timestamps. Define SLAs, escalation, customer communications, and reversal
   authority.
5. Publish incident response: severity levels, on-call roster, key compromise
   procedure, fraud kill switch, customer/merchant notification, regulator/provider
   communication, postmortem template, and recovery exercises.

**Acceptance criteria**

* Legal/compliance owner provides written pilot approval for the selected market.
* Tabletop exercises demonstrate response to key compromise, duplicate settlement,
  provider outage, data incident, and fraud spike.
* Support team completes training using realistic dispute and reversal scenarios.

## 11. Phase 8 — production platform and quality gates

**Dependencies:** all prior phases as applicable.

1. Provision isolated development, staging, and production environments with least
   privilege, managed secrets/KMS, network segmentation, TLS, database encryption
   and backups, restricted admin access, and audited access logs. Infrastructure
   must be version-controlled and peer-reviewed.
2. Implement CI: dependency lockfile checks, SBOM, vulnerability and licence scan,
   secret scan, static analysis, formatting/lint without `--fix`, backend unit and
   E2E tests, mobile type/lint/unit tests, migration test, API contract tests, and
   required review/status checks.
3. Add CD with immutable artifacts, signed mobile builds, approval gates, staged
   rollout/canary, configuration validation, automatic rollback criteria, and
   production migration controls. Do not allow ad-hoc database edits.
4. Instrument privacy-safe observability: request/error/latency metrics, queue
   depth, settlement/reconciliation discrepancies, authentication abuse, webhook
   failure, device-key failures, and business-state metrics. Define dashboards,
   alert thresholds, owners, runbooks, and log retention/redaction.
5. Perform load, soak, chaos/recovery, backup restore, disaster recovery, mobile
   compatibility, accessibility, and independent penetration testing. Fix all
   critical/high findings or obtain documented risk acceptance from accountable
   leadership before pilot.

**Acceptance criteria**

* A fresh environment can be deployed from reviewed automation with no manual
  secret copying or database schema synchronization.
* Backup restoration and disaster-recovery drills meet documented RPO/RTO targets.
* CI blocks vulnerable, untested, unauthorised, or unreviewed releases.
* Monitoring detects a deliberately injected duplicate webhook, reconciliation
  mismatch, elevated auth failures, and queue backlog within agreed alert time.

## 12. Phase 9 — staged pilot and production release gate

**Dependencies:** completion evidence for Phases 0–8.

1. Conduct internal dogfooding using test/sandbox funds and a small controlled
   device/terminal matrix. Rehearse support, dispute, rollback, loss/replacement,
   and outage procedures.
2. Run a limited monitored pilot: low transaction limits, selected merchants,
   restricted geography/cohort, separate provider configuration, manual daily
   reconciliation, heightened on-call coverage, and clear customer disclosure.
3. Review pilot data at agreed intervals: success/decline/error rate, queue age,
   duplicate attempts, reconciliation differences, fraud signals, support contacts,
   accessibility issues, provider performance, and incident response performance.
4. Expand only after risk, finance, security, compliance, operations, and product
   owners each sign the gate. Increase one variable at a time (merchant count,
   transaction limit, geography, or payment channel), with rollback criteria.

### Mandatory production release checklist

* [ ] No known critical/high security finding without formal accountable risk acceptance.
* [ ] Ledger invariants, idempotency, and reconciliation tests pass in staging.
* [ ] All public/state-changing APIs have validation, authentication, authorization,
  rate limiting, redacted responses/logs, and documented contracts.
* [ ] Device and terminal signing keys are non-exportable, enrolled, rotatable, and
  revocable; simulated signatures and bypasses are deleted.
* [ ] HTTPS-only mobile release builds, secure session lifecycle, and durable queue
  behavior pass physical-device tests.
* [ ] Provider sandbox certification, webhook verification, operations runbooks,
  and reconciliation evidence are approved.
* [ ] Backups/restores, incident drills, monitoring alerts, and on-call ownership
  have been exercised successfully.
* [ ] Compliance/legal approval and privacy/customer disclosures are complete.
* [ ] Pilot metrics meet agreed risk and reliability thresholds for the agreed
  observation period.

## 13. Planning artefacts to create before implementation starts

Create and maintain these version-controlled documents alongside code:

1. `docs/architecture/payment-protocol-v1.md` — canonical payloads, signatures,
   keys, trust boundaries, sequence diagrams, error semantics, test vectors.
2. `docs/architecture/ledger.md` — account types, posting rules, state machine,
   idempotency, reconciliation, examples, and migration policy.
3. `docs/security/threat-model.md` — assets, attackers, trust boundaries, NFC/BLE
   relay risks, abuse cases, mitigations, residual risk, owners.
4. `docs/api/authorization-matrix.md` — endpoint, actor, ownership rule, required
   MFA/PIN, rate limit, audit event, response classification.
5. `docs/operations/runbooks/` — deployment, rollback, provider outage, webhook
   failure, reconciliation mismatch, fraud spike, key compromise, restore, and
   customer support escalation.
6. `docs/release/pilot-gates.md` — measurable entry/exit criteria, owners,
   evidence links, and risk acceptance record.

## 14. Suggested work-package sequence

Agents should create PRs in this order; later items may be designed in parallel
but must not merge ahead of their dependencies:

1. P0 configuration/secrets/demo-bypass removal.
2. Payment protocol, ledger state model, and authorization-matrix documents.
3. DTO/validation/redaction and auth/authorization hardening.
4. Database migrations, integer money, ledger, idempotency, and concurrency tests.
5. Device/terminal enrolment and real signing implementation plus test vectors.
6. Mobile secure session, queue, release configuration, and device tests.
7. Provider sandbox, webhook, job, and reconciliation implementation.
8. Platform CI/CD, observability, backup/restore, and security testing.
9. Optional NFC/BLE direct-transport work after online payment pilot rehearsal.
10. Compliance/support/fraud completion, controlled pilot, and release gates.

This sequence deliberately delays Bluetooth, Wi-Fi Direct, and offline acceptance:
transport cannot repair weak identities, simulated signatures, invalid money
calculations, or an unauditable ledger.
