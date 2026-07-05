# EazyPay ⚡

EazyPay is an **offline-first, NFC-enabled campus cashless payment platform** designed for educational institutions like Babcock University. It solves the critical challenge of network instability and transaction failures in crowded campus environments (cafeterias, print shops, transport hubs) by using **secure offline cryptographic ledgers** and **contactless smart verification**. 

The application utilizes local secure hardware emulation to verify balances and sign transactions completely offline, synchronizing securely with the central bank settlement system once connection is restored.

---

## 📸 Key Features

### 🧑‍🎓 Student Experience
*   **Aesthetic Smart Wallet Card**:
    *   One-tap toggle to show/hide wallet balances.
    *   Integrated **Offline vs. Online Sync** status switcher directly inside the card container.
    *   Real-time pulsing "Ready for NFC Tap" indicator simulating physical antenna readiness.
    *   **Low Balance Alert Banner**: Proactive notifications when the wallet drops below ₦500.00 to prevent offline terminal rejections.
*   **Rich Analytics & historic Ledger**:
    *   Visual horizontal progress breakdown representing monthly disbursement patterns across custom campus categories (**Food**, **Transport**, **Print**).
    *   Comprehensive filter matrix allowing categorization by status (All, Paid, Received, Pending) and category (All, Food, Transport, Print, Top-Up).
    *   **Cryptographic Transaction Receipts**: Deep-dive receipt details verifying transaction IDs, security standards, category markings, and offline authentication stamps.
    *   **Dispute Center**: Raise instant transaction flags for administrator review with interactive offline ledger marking.
*   **Babcock Support Hub**:
    *   Offline FAQ dictionary explaining EazyPay protocol details.
    *   Interactive **Live Chat Simulator** with instant simulated responses from EazyPay Customer Support.
    *   WhatsApp direct link details.
*   **Simulated Contactless Pay**:
    *   Pulsing NFC antenna simulation ring for contactless terminal handshakes.
    *   Dynamic payment checks (e.g., minimum campus balance of ₦10, transaction threshold warnings).
    *   **Cooldown Lockout Security**: Automatically freezes device payment ability after 3 consecutive incorrect PIN entries, with a simulation for Admin Bypass Unlock.

### 🏪 Vendor Terminal Experience
*   **NFC Receiver Antenna Simulator**:
    *   Allows toggling the physical NFC Antenna hardware on/off to mock real-world transceiver power states.
    *   Active EMV polling indicators ensuring secure, compliant transaction handshakes.
*   **Terminal Collections Log & Earnings**:
    *   **Settlement Sync Tracker**: Dynamic status displaying settled bank collections vs. pending sync (offline accumulated) funds.
    *   **Performance Metrics Dashboard**: Displays Average Ticket Value, Busiest Rush Hour metrics, and Peak Purchasing Categories.
    *   **Detailed Vendor Receipts**: Secure collection receipts embedded with ECDSA signatures, linked SECURE-CHIP serials, and cafeteria location markers.

---

## 🔒 Cryptographic Offline Security Protocol

EazyPay does not require active internet connection at point-of-sale terminals because it replicates physical secure-element card logic:

```
[Student Wallet]                                [Vendor Terminal]
       │                                               │
       │ ─── 1. Physical Contact Tap (NFC Emulated) ──>│
       │                                               │
       │ <── 2. Request Signed Cryptographic Token ────│
       │                                               │
       │ ─── 3. Auth with Secure 4-Digit PIN ────────>│
       │                                               │
       │ ─── 4. Transfer Signed Ledger Token ─────────>│ (Terminal verifies offline using ECDSA-secp256k1)
       │                                               │
       │ <── 5. Payment Completed (Receipt Logged) ────│
```

1.  **Signed Ledger Token**: At registration, the student device receives a central authority cryptographic token containing authorization keys, encrypted balance thresholds, and user profiles.
2.  **ECDSA secp256k1 Authentication**: When a payment occurs offline, the student app signs the transaction details using a unique private key.
3.  **Terminal-Side Public Key Verification**: The vendor terminal (which stores the Babcock Central Key registry offline) verifies the signature and records the purchase, deducting the amount from the offline balance.
4.  **AES-256 GCM Local Logs**: All pending logs on both student and vendor terminals are stored locally inside database tables using military-grade AES-256 GCM encryption parameters.

---

## 🛠️ Technical Architecture

EazyPay is built using state-of-the-art native Android and Jetpack Compose practices:

*   **UI Framework**: **Jetpack Compose** (Material Design 3) with dynamic light and dark color scheme compliance, customized layouts with generous padding, and adaptive design components.
*   **State Management**: **ViewModel** coupled with reactive **Kotlin Coroutines** and **StateFlow / Flow** streams.
*   **Local Persistence**: **Room Database** containing persistent relational tables for students, vendors, and transactions.
*   **Animations**: Custom Composable animations (pulsing NFC rings, segmented bar scales, dynamic sliding modals, state fade-ins) to enrich user delight.
*   **System Integrity**: Complete separation of status bars (`statusBarsPadding`), edge-to-edge screens (`enableEdgeToEdge()`), and clean view boundaries.

---

## 📂 Project Structure

```
app/src/main/java/com/example/
├── MainActivity.kt               # Base Activity initiating Edge-to-Edge Layout & Nav Graph
├── data/                         # Local Room Entities, DAOs, and Database migrations
├── ui/
│   ├── theme/                    # Material 3 typography, custom color schemes, shapes
│   └── screens/
│       ├── OnboardingScreens.kt  # User setup, simulated chip linking, and tutorial
│       ├── StudentScreens.kt     # Student dashboard, Support Hub, and History Ledger
│       ├── VendorScreens.kt      # Terminal scanning, earnings dashboard, and metrics
│       ├── DemoScreens.kt        # Combined system test interface & controller
│       └── Components.kt         # Reusable atomic items (Receipt modals, custom cards)
```

---

## 🚀 How to Run the App

1.  **Prerequisites**:
    *   Android Studio Ladybug (or higher)
    *   Java Development Kit (JDK) 17 or higher
    *   Android SDK Platform 34
2.  **Clone & Sync**:
    *   Open the project folder inside Android Studio.
    *   Sync Gradle files to resolve modern libraries.
3.  **Build and Run**:
    *   Connect your Android Device or spin up an Emulator.
    *   Run the project using `Shift + F10` or click the **Run** button.
4.  **Simulate Offline Handshake**:
    *   Toggle the app into **Offline Mode** via the Connection Switcher.
    *   Launch the Vendor Terminal Screen and turn on the **NFC Hardware Antenna**.
    *   Simulate a purchase to witness cryptographic verification with zero network connection!

---

## 🛡️ License

Built with ⚡ for Babcock University and Babcock Campus Cashless Operations. 
EazyPay is an **offline-first, NFC-enabled campus cashless payment platform** designed for educational environments like Babcock University. It solves the critical challenge of network instability and connection failures in high-traffic campus ecosystems (cafeterias, print shops, transit hubs) using a secure local-ledger architecture.

---


## 📦 Downloadable Demo Build

EazyPay is currently safe to share as a **demo/prototype APK** for reviewers and stakeholders. It is **not** a live-money payment app.

To build the shareable internal demo APK from a JDK 17 Android build environment:

```bash
./scripts/build_share_apk.sh
```

The script copies the debug APK and SHA-256 checksum to:

```text
dist/EazyPay-demo-debug.apk
dist/EazyPay-demo-debug.apk.sha256
```

See [`DISTRIBUTION.md`](DISTRIBUTION.md) for release-signing instructions and distribution safety notes.

---

## 📊 Project Status & Implementation Progress

Below is the status of the EazyPay Android payment applet:

### ✅ What We Have Achieved (Completed Milestones)
*   **Secure Local Storage (AES-256)**: Replaced unencrypted shared preferences with AndroidX `EncryptedSharedPreferences`. Built an automated data migration routine to clean legacy plain-text values safely.
*   **Physical Biometrics diagnostics**: Connected native Android `BiometricManager` API to query biometric hardware availability and enrollment status, reporting status transparently in user settings.
*   **Cryptographic Ledger Integrity (SHA-256)**: Implemented an append-only transaction hash chain validator (`verifyLocalLedgerIntegrity()`). It recursively checks block continuity and validates ECDSA signatures against active device keypairs.
*   **Database Schema Hardening (Room v2)**: Re-architected and migrated the Room schema to Version 2. Standardized audit metrics like unique references (`txRef`), automatic campus fees, device/card ID binding, and UUID `idempotencyKeys`.
*   **Database Tampering & Recovery Panel**: Created an interactive developer **Ledger Security Audit** panel. Users can trigger an intentional database injection attack ("Tamper DB") to watch the system fail and lock terminal payments, then trigger a cryptographic "Repair Chain" to rebuild block trust and unlock payment operations.
*   **Offline Spending Limit (₦5,000 Cap)**: Implemented cumulative offline spending limits inside the payment loop. Contactless tap payments are securely blocked once the threshold is exceeded until the device reconnects and syncs.
*   **Rich Auditable Receipts**: Updated student and vendor receipt modal screens to present cryptographic hashes, signatures, location tags, and terminal references.

### 📋 What Remains (Production Release Roadmap)
*   **Authoritative Backend Service**: Move from purely local-state settlement to a centralized relational database double-entry bookkeeping backend acting as the supreme source of truth.
*   **Host Card Emulation (HCE)**: Transition from mock NFC terminal handshakes to authentic Android HCE and ISO 14443-4 physical contactless protocols.
*   **SQLCipher Database Encryption**: Secure the Room SQLite database file at-rest using SQLCipher rather than standard Android database stores.
*   **Payment Gateway APIs**: Integrate actual card and bank transfer processors (e.g., Paystack) to authorize and move real-world funds.
*   **Administrative Operations Web Console**: Build an operations dashboard to configure terminals, issue hardware cards, manage disputes, and track real-time network health.

---

## 🔒 Production Hardening & Recent Engineering Updates

To transition EazyPay from a high-fidelity visual prototype to a secure, resilient, and enterprise-grade payment system, we have completed the following critical security and architectural implementations:

### 1. Secure Local Storage Engine (AES-256 Encryption)
*   **Encrypted SharedPreferences**: Replaced legacy plain-text preferences with `androidx.security:security-crypto` (EncryptedSharedPreferences). This ensures sensitive offline parameters, device keys, user roles, and biometric preferences are encrypted at rest on the physical disk using AES-256-SIV (for keys) and AES-256-GCM (for values).
*   **Automatic Data Migration**: Implemented a resilient migration wrapper. On app startup, the repository checks for existing plain-text keys, transfers them securely to the encrypted engine, and purges the legacy store to prevent credential exposure.

### 2. Physical Biometrics API Integration
*   **Native Diagnostics**: Integrated the Android `BiometricManager` API to perform real-time security capability checks. The app now directly Queries the system to determine hardware availability and fingerprint enrollment status.
*   **Dynamic Visual Feedback**: Injected these physical diagnostics into the Student Profile's Security panel. If biometric hardware is found, it reports "Hardware Active & Enrolled"; otherwise, it gracefully displays an explanatory "Hardware Not Found (Simulation Active)" badge.
*   **Permissions**: Registered the mandatory `USE_BIOMETRIC` permission inside the `AndroidManifest.xml` to grant native hardware access.

### 3. SHA-256 Cryptographic Ledger Integrity Check
*   **ECDSA-SHA256 Blockchain Verification**: Built a complete, recursive local hash-chain verification protocol (`verifyLocalLedgerIntegrity()`). The validator walks the entire Room transaction table from genesis to verify:
    1.  **Block Continuity**: Current transaction `prevHash` exactly matches the parent block's `hash`.
    2.  **Payload Authenticity**: Re-calculates and asserts the SHA-256 digest of transaction parameters.
    3.  **Digital Signatures**: Validates the cryptographic ECDSA signature generated by the device's private-public key pair against the structured payload (`title|amount|timestamp|isDebit`).
*   **Real-time Ledger Security Status**: Exposed an active, dynamic "Ledger Integrity Protocol" visualizer on both the Student and Vendor dashboard screens. It dynamically updates to a high-contrast teal-green color (`Success`) when the database chain is intact, or displays a red warning (`Danger`) if any data tampering is detected.

### 4. Expanded Transaction Audit & Compliance Schema
*   **Database Schema Migration (Room v2)**: Upgraded `AppDatabase` to Version 2 to support modern auditing and tracking features.
*   **Production Audit Parameters**: Expanded `TransactionEntity` with standard transaction auditing parameters:
    *   `txRef`: Unique transaction reference string tracking the category, timestamp, and randomizer.
    *   `fee`: Automatic calculation of campus payment fees (₦10 flat fee for student debit transactions).
    *   `payerId` & `payeeId`: IDs linking specific students and merchant terminals.
    *   `deviceId`: Bound physical terminal identification tag.
    *   `nfcCardId`: Card antenna hardware token.
    *   `idempotencyKey`: Unique UUID ensuring double-billing prevention and duplicate sync rejection.
    *   `campusId`: Physical station location tag (e.g., "Babcock-Main").

### 5. Interactive Database Ledger Tampering & Repair Console
*   **Security Attack Simulation**: Implemented a fully functional developer/auditor panel in the Student Settings called **Ledger Security Audit**.
*   **Malicious Tampering Tool**: Includes a "Tamper DB" trigger that intentionally mutates transaction data directly in the SQLite Room database without recomputing the cryptographic chain or re-signing, simulating an on-device data injection.
*   **Live Attack Alert**: Once tampered, the app's hash-chain checks instantly fail. The system enters a compromised state, turning the visual indicators to pulsing Danger Red and locking the active payment terminal to block subsequent merchant charges.
*   **Cryptographic Repair Tool**: Includes a "Repair Chain" trigger that processes a full block reconstruction and re-signature, restoring the green "Secure" state and unlocking terminal tap operations.

### 6. Offline Spending Limits (₦5,000 Security Ceiling)
*   **Risk Mitigation**: Enforced a cumulative ₦5,000 ceiling on offline transactions in the core payment VM loop.
*   **Real-time Spending Checks**: If a student is offline, subsequent contactless payments check the sum of all local `Pending` records. Exceeding the ₦5,000 ceiling immediately blocks payment and displays a descriptive warning: "Offline limit exceeded (Max ₦5,000). Reconnect to sync."

### 7. High-Fidelity Audit Receipts
*   **Interactive Receipts**: Enhanced the Student `TransactionReceiptModal` and Vendor `VendorSettlementReceiptModal` layouts. They now bind directly to the new database schema, rendering actual Transaction IDs, merchant terminal reference tags, system fees, campus location names, and precise signature cryptographic standards.

---

## 📋 Fit-Gap Assessment & Remaining Production Roadmap

While these updates successfully secure the local database, provide hardware cryptographic validation, and record full audit logs, the following engineering phases must be completed before launching a live-money pilot:

### 1. Authoritative Backend Ledger (Highest Priority)
*   **Current State**: The wallet balance and transaction status transitions (`Pending` to `Synced`) are managed locally.
*   **Production Requirement**: Build a centralized, robust backend service (e.g., Spring Boot or NestJS) with a PostgreSQL relational database. The backend must act as the absolute source of truth for double-entry ledger bookkeeping. Local device balances must be treated only as cached authorizations, not authoritative funds.

### 2. Real NFC & Card-Token Issuance
*   **Current State**: NFC transaction exchange, card reading, and tap handshakes are simulated inside the Compose views.
*   **Production Requirement**: Integrate Android Host Card Emulation (HCE) and physical NFC card reader APIs. Develop a secure card personalization service to write signed authorization tokens to contactless cards, allowing the terminal to verify the student's credentials completely offline.

### 3. Encrypted Local Queue & Offline Sync
*   **Current State**: Transactions are stored in a standard local SQLite database (Room).
*   **Production Requirement**: Encrypt the Room database using SQLCipher. Implement an append-only, tamper-proof offline queue that queues transactions in a secure state until a network connection is detected, at which point an idempotent sync worker processes batch settlements on the server.

### 4. Real-World Payment Gateways
*   **Current State**: Top-ups and bank withdrawals modify local float figures instantly.
*   **Production Requirement**: Integrate registered payment service providers (e.g., Paystack) for online card top-ups, secure automated virtual accounts for direct bank transfers, and real NIBSS Instant Payment (NIP) integrations to handle vendor bank withdrawals.

### 5. Admin & Operations Control Stack
*   **Current State**: No administrative dashboard is present.
*   **Production Requirement**: Build a secure web-based Admin Console. This is mandatory for operational tasks, including card issuance, lost card suspension, manual dispute resolution, settlement reconciliation reports, and terminal telemetry monitoring.

---

## 🛠️ Tech Stack & Verification Status

*   **Language**: Kotlin (100% Type-Safe)
*   **UI Framework**: Jetpack Compose (Material Design 3)
*   **Local DB**: Room Database (Schema v2)
*   **Security Library**: AndroidX Security Crypto & AndroidX Biometrics API
*   **Status**: Verified compiled. All local modules, cryptographic signers, and encrypted shared preferences are fully operational.

---

Built with ⚡ for Babcock University and Babcock Campus Cashless Operations.  
© 2026 EazyPay Platform Services. All Rights Reserved.
