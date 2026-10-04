#!/usr/bin/env node

/**
 * BatchProof - Hedera Topic Setup Utility
 * Creates a dedicated Hedera Consensus Service (HCS) Topic for medicine batch verification.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Simple .env parser to read root .env or .env.local if present
function loadEnv() {
  const envPaths = [
    path.join(rootDir, ".env.local"),
    path.join(rootDir, ".env"),
    path.join(rootDir, "packages", "nextjs", ".env.local"),
    path.join(rootDir, "packages", "nextjs", ".env"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

async function main() {
  console.log("=================================================");
  console.log("   BatchProof - Hedera HCS Topic Setup Tool     ");
  console.log("=================================================\n");

  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network = process.env.HEDERA_NETWORK || "testnet";
  const demoMode = process.env.DEMO_MODE === "true" || !operatorId || !operatorKey;

  if (demoMode) {
    console.log("ℹ️  Running in DEMO MODE (or Hedera credentials not configured).");
    console.log("   No live transactions will be sent to the Hedera network.\n");
    console.log("   Default Simulated Topic ID : 0.0.7812044");
    console.log("   Network                    : Hedera " + network.toUpperCase());
    console.log("   Status                     : READY FOR OFFLINE DEMO & TESTING\n");
    console.log("-------------------------------------------------");
    console.log("To connect to REAL Hedera Testnet:");
    console.log("1. Get free testnet account & keys at https://portal.hedera.com");
    console.log("2. Copy .env.example to .env:");
    console.log("   HEDERA_NETWORK=testnet");
    console.log("   HEDERA_OPERATOR_ID=0.0.xxxxxx");
    console.log("   HEDERA_OPERATOR_KEY=302e020100...");
    console.log("   DEMO_MODE=false");
    console.log("3. Re-run `npm run hedera:setup` to provision a live topic.");
    console.log("=================================================\n");
    process.exit(0);
  }

  console.log(`Connecting to Hedera ${network.toUpperCase()} as Operator: ${operatorId}...`);

  try {
    const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction, PrivateKey } = await import(
      "@hashgraph/sdk"
    );

    let client = network.toLowerCase() === "mainnet" ? Client.forMainnet() : Client.forTestnet();

    let privateKeyObj;
    try {
      if (operatorKey.startsWith("0x")) {
        privateKeyObj = PrivateKey.fromStringECDSA(operatorKey);
      } else {
        privateKeyObj = PrivateKey.fromString(operatorKey);
      }
    } catch {
      privateKeyObj = PrivateKey.fromStringDer(operatorKey);
    }

    client.setOperator(operatorId, privateKeyObj);

    console.log("Creating new Hedera Consensus Service topic...");

    const tx = await new TopicCreateTransaction()
      .setTopicMemo("BatchProof Medicine Verification Audit Log")
      .execute(client);

    const receipt = await tx.getReceipt(client);
    const topicId = receipt.topicId.toString();

    console.log("\n✅ HCS Topic created successfully!");
    console.log(`   Topic ID: ${topicId}`);

    console.log("\nSubmitting genesis initialization message...");
    const genesisMsg = JSON.stringify({
      schemaVersion: "1.0.0",
      eventType: "BATCH_REGISTERED",
      batchId: "GENESIS-001",
      recordHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      issuerAccountId: operatorId,
      timestamp: new Date().toISOString(),
      status: "VALID",
      notes: "BatchProof HCS Topic Genesis Initialization",
    });

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(receipt.topicId)
      .setMessage(genesisMsg)
      .execute(client);

    await submitTx.getReceipt(client);
    console.log("✅ Genesis message sequenced by Hedera consensus nodes.");

    console.log("\n-------------------------------------------------");
    console.log(`Created HCS Topic: ${topicId}`);

    const envTargets = [
      path.join(rootDir, ".env"),
      path.join(rootDir, "packages", "nextjs", ".env"),
    ];

    for (const target of envTargets) {
      if (fs.existsSync(target)) {
        let content = fs.readFileSync(target, "utf8");
        if (/^HEDERA_TOPIC_ID=/m.test(content)) {
          content = content.replace(/^HEDERA_TOPIC_ID=.*$/m, `HEDERA_TOPIC_ID=${topicId}`);
        } else {
          content += `\nHEDERA_TOPIC_ID=${topicId}\n`;
        }
        if (/^DEMO_MODE=/m.test(content)) {
          content = content.replace(/^DEMO_MODE=.*$/m, `DEMO_MODE=false`);
        }
        fs.writeFileSync(target, content, "utf8");
        console.log(`✅ Saved HEDERA_TOPIC_ID=${topicId} and DEMO_MODE=false to ${path.relative(rootDir, target) || ".env"}`);
      }
    }

    console.log("=================================================\n");
  } catch (err) {
    console.error("\n❌ Failed to create Hedera HCS Topic:", err.message);
    process.exit(1);
  }
}

main();
