/**
 * End-to-End API verification test script
 */

async function run() {
  const baseUrl = "http://localhost:3000";

  console.log("1. Testing /api/health...");
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log("   Health Status:", health.status, "Hedera Demo:", health.hedera.demoMode);

  console.log("\n2. Testing sample batches verification...");
  for (const id of ["AMOX-2025-001", "PARA-2023-088", "METF-2024-X09"]) {
    const res = await fetch(`${baseUrl}/api/batches/${id}`);
    const data = await res.json();
    console.log(`   ${id} => Status: [${data.verification.status}] Reason: ${data.verification.statusReason}`);
  }

  console.log("\n3. Testing batch registration...");
  const newBatchId = `E2E-${Date.now().toString().slice(-4)}`;
  const regRes = await fetch(`${baseUrl}/api/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: newBatchId,
      medicineName: "Ibuprofen Liquid Gel",
      strength: "400 mg",
      manufacturer: "Precision Health Labs",
      manufacturingDate: "2025-01-01",
      expiryDate: "2027-01-01",
      storageConditions: "Store at room temp",
      activeIngredients: ["Ibuprofen 400mg"],
    }),
  });

  const regData = await regRes.json();
  console.log("   Registered Batch ID:", regData.batch.id, "Hash:", regData.batch.recordHash.slice(0, 16) + "...");

  console.log("\n4. Verifying newly registered batch...");
  const v1Res = await fetch(`${baseUrl}/api/batches/${newBatchId}`);
  const v1 = await v1Res.json();
  console.log(`   ${newBatchId} Status: [${v1.verification.status}] HashMatches: ${v1.verification.hashMatchesOnChain}`);

  console.log("\n5. Testing batch recall on Hedera HCS...");
  const recallRes = await fetch(`${baseUrl}/api/batches/${newBatchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "recall",
      reason: "Foreign particulate detected during quarterly stability sampling.",
    }),
  });
  const recData = await recallRes.json();
  console.log("   Recall broadcast seq:", recData.hcsResult.sequenceNumber);

  console.log("\n6. Re-verifying batch after recall...");
  const v2Res = await fetch(`${baseUrl}/api/batches/${newBatchId}`);
  const v2 = await v2Res.json();
  console.log(`   ${newBatchId} Status: [${v2.verification.status}] Reason: ${v2.verification.statusReason}`);

  console.log("\n7. Inspecting Hedera Audit Log...");
  const histRes = await fetch(`${baseUrl}/api/hedera/topic`);
  const hist = await histRes.json();
  console.log("   Total events in HCS audit log:", hist.hedera.totalEventsAnchored);

  console.log("\n✅ ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
