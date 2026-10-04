# BatchProof 💊🛡️
> Production-quality Scaffold-HBAR template for instant, tamper-evident medicine-batch verification on the **Hedera Consensus Service (HCS)**.

[![Hedera](https://img.shields.io/badge/Hedera-HCS%20Audit%20Trail-00EA90?logo=hedera&logoColor=black)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/deamybro/batchproof&root-directory=packages/nextjs)

---

## Architecture Diagram

```
User / Pharmacist ───▶ Next.js Web App ───▶ Verification Service ───▶ Off-Chain Records
                                                        │
                                                        ▼
                                           Hedera HCS Audit Log
                                           (Append-Only Topic)
                                           • BATCH_REGISTERED
                                           • BATCH_UPDATED
                                           • BATCH_RECALLED
```

---

## 1. The Problem
Pharmaceutical supply chains face critical threats:
- **Counterfeit Medicines:** Counterfeit and substandard drugs compromise patient recovery and claim hundreds of thousands of lives globally each year.
- **Unauthorized Expiry Extension:** Disreputable distributors repackage expired medication with modified expiration dates.
- **Silent & Delayed Recalls:** When a batch is recalled due to particulate contamination, impurity breaches (such as NDMA), or packaging flaws, notifications take weeks to trickle down to retail pharmacies and patients.
- **Centralized Vulnerabilities:** Centralized vendor databases are susceptible to retroactive database edits, downtime, and vendor lock-in.

---

## 2. The User Workflow
BatchProof delivers verification in under 3 seconds:
1. **Packaging Scan or Input:** A pharmacist or consumer enters the alphanumeric batch code printed on the blister pack or scans the 2D DataMatrix code.
2. **Canonical Hash Verification:** The verification engine retrieves the off-chain batch record, canonicalizes the core parameters (ID, medicine name, strength, manufacturer, manufacturing date, and expiry date), and computes the SHA-256 fingerprint.
3. **Consensus Validation:** The record digest is validated against the sequence of events published to the Hedera Consensus Topic.
4. **Immediate Status Assessment:**
   - 🟢 **`VALID`**: Active, unexpired, and within valid shelf life.
   - 🟠 **`EXPIRED`**: The calculated expiry timestamp has elapsed. Warning triggers to halt dispensing.
   - 🔴 **`RECALLED`**: The manufacturer or regulatory authority has broadcast a recall event to the Hedera topic. Includes official recall rationale.

---

## 3. Why Hedera Consensus Service (HCS)?
- **Fair Timestamping & Ordering:** Hedera's Hashgraph consensus algorithm provides provable fair ordering with cryptographic consensus timestamps down to the nanosecond.
- **Sub-Second Finality:** Transactions achieve immutable consensus in 2–3 seconds without multi-minute block confirmations.
- **Predictable, Micro-Cent Fees:** At ~$0.0001 USD per topic message, millions of medicine packages can be anchored cost-effectively.
- **Append-Only Integrity:** No single node or centralized entity can delete or silently rewrite previous recall or registration events.

---

## 4. What is Stored On-Chain vs. Off-Chain

| Scope | Location | Details |
| :--- | :--- | :--- |
| **On-Chain (Hedera HCS)** | Immutable Topic Message | • Event type (`BATCH_REGISTERED`, `BATCH_UPDATED`, `BATCH_RECALLED`)<br>• Batch code (e.g., `AMOX-2025-001`)<br>• Canonical SHA-256 record hash<br>• Issuer Hedera Account ID (e.g., `0.0.4829104`)<br>• Lifecycle status (`VALID`, `EXPIRED`, `RECALLED`)<br>• Recall reason (public safety alert text)<br>• Timestamp |
| **Off-Chain** | Secure Application Store / DB | • Medicine name and strength<br>• Full manufacturer credentials<br>• Storage and transport conditions<br>• Active ingredients list |
| **NEVER Stored** | *Strictly Excluded* | • Patient names, medical conditions, or prescriptions<br>• Private manufacturer trade secret formulations<br>• Operator private keys |

---

## 5. Local Setup

### Prerequisites
- **Node.js**: `v20.18.3` or later (Tested with Node `v24.15.0`)
- **npm**: `v10+` or `v11+`

### Installation
Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/your-username/batchproof.git
cd batchproof
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Demo Mode
BatchProof is pre-configured to run out of the box in **Demo Mode** (`DEMO_MODE=true`):
- **Zero Hedera Credentials Required:** Anyone can clone and run the application locally without an account or credit card.
- **3 Seeded Realistic Sample Batches:**
  1. `AMOX-2025-001` (Amoxicillin 500mg) — **VALID**
  2. `PARA-2023-088` (Paracetamol 650mg) — **EXPIRED**
  3. `METF-2024-X09` (Metformin ER 850mg) — **RECALLED** (NDMA impurity threshold recall)
- **Instant Testing:** One-click demo buttons on both the landing page and the verification interface.

---

## 7. Hedera Testnet Setup
To connect to the live Hedera Testnet:
1. Register for a free testnet developer account at [https://portal.hedera.com](https://portal.hedera.com).
2. Note your **Account ID** (e.g. `0.0.1234567`) and your **Private Key** (DER or HEX format).
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Set `DEMO_MODE=false` and populate your credentials:
   ```env
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=0.0.1234567
   HEDERA_OPERATOR_KEY=302e020100300506032b...
   DEMO_MODE=false
   ```

---

## 8. Creating an HCS Topic
Run the automated topic provisioning script:
```bash
npm run hedera:setup
```

The script will:
1. Validate your operator credentials against Hedera Testnet.
2. Submit a `TopicCreateTransaction` with the memo `"BatchProof Medicine Verification Audit Log"`.
3. Submit a genesis initialization event to test consensus sequencing.
4. Output your new `HEDERA_TOPIC_ID` (e.g. `0.0.7812044`).
5. Copy the topic ID into your `.env`.

---

## 9. Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `HEDERA_NETWORK` | Hedera network target (`testnet` or `mainnet`) | `testnet` |
| `HEDERA_OPERATOR_ID` | Hedera account paying for HCS messages | `0.0.1234567` |
| `HEDERA_OPERATOR_KEY` | Private key for the operator account (Never exposed client-side) | `302e020100...` |
| `HEDERA_TOPIC_ID` | HCS Topic ID for batch verification events | `0.0.7654321` |
| `DEMO_MODE` | Toggle simulated consensus vs live network | `true` |

---

## 10. Running Tests
BatchProof includes full test suites across both workspaces:

```bash
# Run all tests (Next.js unit tests + Hardhat contract tests)
npm run test

# Run Next.js vitest unit tests only
npm run test:nextjs

# Run Hardhat Solidity tests only
npm run test:hardhat
```

### Covered Test Specifications:
- `__tests__/batch-hash.test.ts`: Deterministic canonical JSON key ordering, SHA-256 digest computation, tampering detection.
- `__tests__/status-calculator.test.ts`: Verification logic for VALID, EXPIRED, and RECALLED states with priority resolution.
- `__tests__/expiry-handling.test.ts`: Date parsing to UTC end-of-day, active window evaluation, negative shelf-life calculation.
- `__tests__/recall-handling.test.ts`: Recall reason persistence, duplicate recall prevention, store synchronization.
- `__tests__/hcs-event.test.ts`: Schema validation, lossless serialization, deserialization, consensus metadata attachment.
- `packages/hardhat/test/BatchProofRegistry.test.ts`: On-chain smart contract registration, unauthorized recall rejection, hash verification.

---

## 11. Deploying to Vercel
BatchProof is fully optimized for Vercel deployment:
1. Push your repository to GitHub or GitLab.
2. In the Vercel dashboard, click **"New Project"** and import the repository.
3. Set the **Root Directory** to `packages/nextjs` (or leave default with workspaces).
4. Configure Environment Variables in the Vercel Project Settings:
   - `DEMO_MODE`: `true` (for public showcase) or `false` (with Hedera credentials)
   - `HEDERA_NETWORK`: `testnet`
   - `HEDERA_OPERATOR_ID`: Your Hedera Account ID
   - `HEDERA_OPERATOR_KEY`: Your Hedera Private Key
   - `HEDERA_TOPIC_ID`: Your HCS Topic ID
5. Click **Deploy**. Vercel will build and host the Next.js App Router application.

---

## 12. Security and Privacy Limitations
- **Verification Prototype Disclaimer:** BatchProof verifies that a batch identifier and cryptographic hash match the record anchored by the registered issuer. It is **not** an official regulatory certification or a replacement for physical laboratory chemical analysis.
- **Physical-to-Digital Linkage:** A valid record on Hedera proves that the batch was registered and not recalled. Physical security measures (tamper-evident blister packaging, RFID/holographic seals) remain essential to prevent physical counterfeiters from copying valid public batch numbers.
- **Key Isolation:** Private keys are strictly confined to server-side Next.js route handlers and CLI setup scripts. No secret keys or credentials are ever transmitted to or stored within browser sessions.

---

## 13. Future Production Improvements
1. **Decentralized Identifiers (DIDs) & Verifiable Credentials (VCs):** Anchor manufacturer credentials using W3C DIDs registered on Hedera via DID methods.
2. **GS1 Digital Link Compatibility:** Native parsing of GS1-128 and 2D DataMatrix barcodes formatted under international GS1 healthcare standards.
3. **Hardware Security Module (HSM) Signing:** Packaging facility IoT gateways signing batch creation events directly with secure hardware enclaves before HCS dispatch.
4. **Mirror Node Streaming:** Real-time WebSocket subscriptions to Hedera Mirror Nodes for instant point-of-sale recall alerts.
5. **Decentralized Storage Backing:** Storing full regulatory compliance dossiers and certificates of analysis on IPFS or Filecoin with CIDs referenced in the HCS topic message.

---

## License
MIT License. Created for the Hedera developer ecosystem and the Scaffold-HBAR community.
