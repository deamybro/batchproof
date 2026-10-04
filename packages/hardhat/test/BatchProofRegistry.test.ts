import { expect } from "chai";
import { ethers } from "hardhat";

describe("BatchProofRegistry", function () {
  let registry: any;
  let owner: any;
  let issuer: any;
  let otherAccount: any;

  const sampleBatchId = "AMOX-2026-901";
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("AMOXICILLIN-500MG-BATCH-901"));
  const sampleManufacturer = "Apex Pharmaceuticals";
  const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year ahead

  beforeEach(async function () {
    [owner, issuer, otherAccount] = await ethers.getSigners();
    const BatchProofRegistryFactory = await ethers.getContractFactory("BatchProofRegistry");
    registry = await BatchProofRegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  it("should register a medicine batch successfully", async function () {
    await expect(
      registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry)
    )
      .to.emit(registry, "BatchRegistered")
      .withArgs(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry, issuer.address);

    const batch = await registry.getBatch(sampleBatchId);
    expect(batch.exists).to.equal(true);
    expect(batch.id).to.equal(sampleBatchId);
    expect(batch.recordHash).to.equal(sampleHash);
    expect(batch.manufacturer).to.equal(sampleManufacturer);
    expect(batch.currentStatus).to.equal(0); // BatchStatus.VALID
  });

  it("should fail when registering duplicate batch ID", async function () {
    await registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry);
    await expect(
      registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry)
    ).to.be.revertedWith("Batch already registered");
  });

  it("should verify valid batch hash matches", async function () {
    await registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry);
    const [matches, status] = await registry.verifyBatchHash(sampleBatchId, sampleHash);
    expect(matches).to.equal(true);
    expect(status).to.equal(0); // VALID

    const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("TAMPERED-RECORD"));
    const [wrongMatches] = await registry.verifyBatchHash(sampleBatchId, wrongHash);
    expect(wrongMatches).to.equal(false);
  });

  it("should allow issuer to mark batch as recalled", async function () {
    await registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry);

    await expect(registry.connect(issuer).recallBatch(sampleBatchId, "Contamination during packaging"))
      .to.emit(registry, "BatchRecalled")
      .withArgs(sampleBatchId, "Contamination during packaging", (val: any) => val > 0, issuer.address);

    const batch = await registry.getBatch(sampleBatchId);
    expect(batch.currentStatus).to.equal(2); // RECALLED
  });

  it("should reject recall from unauthorized account", async function () {
    await registry.connect(issuer).registerBatch(sampleBatchId, sampleHash, sampleManufacturer, futureExpiry);
    await expect(
      registry.connect(otherAccount).recallBatch(sampleBatchId, "Malicious recall")
    ).to.be.revertedWith("Unauthorized");
  });
});
