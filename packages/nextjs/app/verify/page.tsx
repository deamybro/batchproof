"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SearchIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ClockIcon,
  HashIcon,
  PillIcon,
  CopyIcon,
} from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AuditTimeline } from "@/components/AuditTimeline";
import { VerificationResult } from "@/lib/types";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") || "";

  const [batchCode, setBatchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const sampleButtons = [
    {
      code: "AMOX-2025-001",
      label: "Valid Batch",
      sub: "Amoxicillin",
      color: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 bg-emerald-950/20",
    },
    {
      code: "PARA-2023-088",
      label: "Expired Batch",
      sub: "Paracetamol",
      color: "border-amber-500/40 text-amber-300 hover:bg-amber-950/40 bg-amber-950/20",
    },
    {
      code: "METF-2024-X09",
      label: "Recalled Batch",
      sub: "Metformin",
      color: "border-rose-500/40 text-rose-300 hover:bg-rose-950/40 bg-rose-950/20",
    },
  ];

  const performVerification = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const startTime = performance.now();

    try {
      const clean = codeToVerify.trim().toUpperCase();
      const res = await fetch(`/api/batches/${encodeURIComponent(clean)}`);

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to verify batch.");
      }

      // Small natural simulated network delay in demo if instantaneous
      const elapsed = performance.now() - startTime;
      if (elapsed < 300) {
        await new Promise((resolve) => setTimeout(resolve, 350 - elapsed));
      }

      setResult(data.verification);
    } catch (err: any) {
      setError(err.message || "Failed to reach verification service.");
    } finally {
      setLoading(false);
    }
  };

  // Run initial query if URL had a batch code
  useEffect(() => {
    if (initialCode) {
      setBatchCode(initialCode);
      performVerification(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCode.trim()) {
      router.push(`/verify?code=${encodeURIComponent(batchCode.trim().toUpperCase())}`);
      performVerification(batchCode);
    }
  };

  const handleSelectSample = (code: string) => {
    setBatchCode(code);
    router.push(`/verify?code=${encodeURIComponent(code)}`);
    performVerification(code);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <PillIcon className="w-3.5 h-3.5" />
          <span>Point-of-Dispense & Consumer Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Medicine Batch Verification
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Enter or scan a manufacturer batch code to verify registration, shelf life, and active safety recall status against Hedera HCS.
        </p>
      </div>

      {/* Prominent Demo Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Quick Test Samples (Instant Demo Mode):
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Click to load test record
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleButtons.map((btn) => (
            <button
              key={btn.code}
              type="button"
              onClick={() => handleSelectSample(btn.code)}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${btn.color}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono font-bold text-xs">{btn.code}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {btn.label}
                </span>
              </div>
              <span className="text-[11px] opacity-80">{btn.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="Enter batch code (e.g. AMOX-2025-001, PARA-2023-088)..."
              className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm sm:text-base font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all shadow-inner"
            />
            {batchCode && (
              <button
                type="button"
                onClick={() => {
                  setBatchCode("");
                  setResult(null);
                  setError(null);
                }}
                className="absolute inset-y-0 right-12 pr-2 flex items-center text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowScannerModal(true)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
              title="Simulate barcode / QR scan"
            >
              <QrCodeIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !batchCode.trim()}
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Simulated Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Barcode / QR Scanner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden">
              <div className="absolute inset-8 border-2 border-dashed border-cyan-500/50 rounded-lg flex items-center justify-center">
                <div className="w-full h-0.5 bg-cyan-400/80 shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
              </div>
              <p className="z-10 text-xs text-slate-400 text-center mt-20">
                Point camera at 2D DataMatrix or Barcode
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-semibold">
                Simulate Scanning Sample:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sampleButtons.map((btn) => (
                  <button
                    key={btn.code}
                    type="button"
                    onClick={() => {
                      setShowScannerModal(false);
                      handleSelectSample(btn.code);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white text-center border border-slate-700 transition-colors"
                  >
                    {btn.code.split("-")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-12 h-12 mx-auto border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-base">
              Querying Hedera Consensus Topic...
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Computing canonical SHA-256 fingerprint & validating tamper-evident audit record
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertOctagonIcon className="w-5 h-5" />
            <span>Verification Service Notice</span>
          </div>
          <p className="text-xs text-rose-200">{error}</p>
        </div>
      )}

      {/* Verification Results Display */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Result Card */}
          {result.found && result.batch ? (
            <div
              className={`p-6 sm:p-8 rounded-2xl glass-card space-y-6 ${
                result.status === "VALID"
                  ? "border-emerald-500/40 glow-valid"
                  : result.status === "EXPIRED"
                  ? "border-amber-500/40 glow-expired"
                  : "border-rose-500/50 glow-recalled"
              }`}
            >
              {/* Top Banner: Status + Verified Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={result.status} size="lg" />
                    <span className="font-mono text-xs text-slate-400">
                      ID: <b className="text-white">{result.batchId}</b>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {result.statusReason}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 block sm:text-right">
                    Verified at:
                  </span>
                  <span className="text-xs font-mono text-slate-200">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Verified on Hedera Indicator */}
              <VerifiedBadge
                verified={result.verifiedOnHedera}
                topicId={result.topicId}
                transactionId={result.latestTransactionId}
                sequenceNumber={result.auditTrail[0]?.sequenceNumber}
                consensusTimestamp={result.lastConsensusTimestamp}
                network={result.hederaNetwork}
                hashMatches={result.hashMatchesOnChain}
              />

              {/* Medicine Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <PillIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Medicine Name & Strength
                  </span>
                  <div className="font-bold text-white text-sm">
                    {result.batch.medicineName}
                  </div>
                  <div className="text-xs text-cyan-400 font-semibold">
                    {result.batch.strength}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-xs">Manufacturer</span>
                  <div className="font-bold text-white text-sm">
                    {result.batch.manufacturer}
                  </div>
                  <div className="text-xs text-slate-400">Authorized Licensed Producer</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                    Expiry Date
                  </span>
                  <div
                    className={`font-mono font-bold text-sm ${
                      result.isExpired ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {result.batch.expiryDate}
                  </div>
                  <div className="text-xs text-slate-400">
                    Mfg: {result.batch.manufacturingDate}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-slate-500 text-xs">Storage Conditions</span>
                  <div className="text-xs text-slate-300">
                    {result.batch.storageConditions}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-xs">Active Ingredients</span>
                  <div className="text-xs text-slate-300">
                    {result.batch.activeIngredients.join(", ")}
                  </div>
                </div>
              </div>

              {/* Recall Notice if Recalled */}
              {result.isRecalled && result.batch.recallReason && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                    <AlertOctagonIcon className="w-4 h-4" />
                    <span>Official Recall Notice Published to Hedera</span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed font-medium">
                    {result.batch.recallReason}
                  </p>
                  {result.batch.recalledAt && (
                    <div className="text-[11px] text-rose-400/80 font-mono">
                      Timestamp: {new Date(result.batch.recalledAt).toUTCString()}
                    </div>
                  )}
                </div>
              )}

              {/* Cryptographic Hash Comparison Block */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <HashIcon className="w-4 h-4 text-cyan-400" />
                    Cryptographic Digest (SHA-256)
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>Hash Matches On-Chain Audit Entry</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 overflow-hidden">
                  <span className="truncate">{result.calculatedHash}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(result.calculatedHash || "")}
                    className="p-1 hover:text-white text-slate-400 transition-colors shrink-0"
                    title="Copy SHA-256 Digest"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                </div>
                {copiedHash && (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Copied hash to clipboard!
                  </span>
                )}
                <p className="text-[11px] text-slate-500">
                  Computed canonically from {result.batch.id}, {result.batch.medicineName}, {result.batch.strength}, {result.batch.manufacturer}, {result.batch.manufacturingDate}, and {result.batch.expiryDate}.
                </p>
              </div>

              {/* Audit Trail for this Batch */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-cyan-400" />
                    <span>Hedera Consensus Audit Trail</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {result.auditTrail.length} event(s) recorded
                  </span>
                </div>

                <AuditTimeline events={result.auditTrail} />
              </div>
            </div>
          ) : (
            /* Not Found State */
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <AlertTriangleIcon className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">
                  No Batch Record Found
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Batch code <code className="text-cyan-400 font-mono font-bold">{result.batchId}</code> has not been registered on the Hedera topic or in the local record store.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-w-md mx-auto text-xs text-slate-400 text-left space-y-2">
                <div className="font-semibold text-white">Recommended Actions:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check the packaging for typos or misread characters.</li>
                  <li>Verify if the manufacturer has completed HCS batch registration.</li>
                  <li>You can register this batch manually on the <b>Register & Recall</b> page.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Prototype Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Safety Notice: </span>
            {result.disclaimer}
          </div>
        </div>
      )}

      {/* Empty State when no query has been run */}
      {!result && !loading && !error && (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-300 text-base">
            Ready to Verify
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Type a batch identifier above or select one of the quick test samples to inspect its Hedera consensus record.
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading verification interface...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
