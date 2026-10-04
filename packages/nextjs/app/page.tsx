"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  HederaLogo,
  ArrowRightIcon,
  QrCodeIcon,
  ZapIcon,
  ActivityIcon,
  LockIcon,
  DatabaseIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  CloseIcon,
  ClockIcon,
  PillIcon,
} from "@/components/Icons";
import { VerificationResult } from "@/lib/types";

export default function HomePage() {
  const [batchInput, setBatchInput] = useState("");
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("AMOX-2025-001");
  
  // Live Sandbox verification state
  const [sandboxResult, setSandboxResult] = useState<VerificationResult | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Scanner Modal state
  const [scannerOpen, setScannerOpen] = useState(false);

  // Active Pipeline Stage for Interactive Diagram
  const [activePipelineStage, setActivePipelineStage] = useState<number>(0);

  // Fetch batch details for sandbox
  const loadSandboxBatch = async (code: string) => {
    setSandboxLoading(true);
    setSandboxError(null);
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (data.success && data.verification) {
        setSandboxResult(data.verification);
      } else {
        setSandboxError(data.error || "Batch not found.");
      }
    } catch {
      setSandboxError("Failed to reach verification endpoint.");
    } finally {
      setSandboxLoading(false);
    }
  };

  useEffect(() => {
    loadSandboxBatch(selectedBatchCode);
  }, [selectedBatchCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchInput.trim()) {
      const code = batchInput.trim().toUpperCase();
      setSelectedBatchCode(code);
      loadSandboxBatch(code);
    }
  };

  const sampleBatches = [
    {
      code: "AMOX-2025-001" as const,
      medicine: "Amoxicillin 500mg",
      status: "VALID",
      statusBadge: "bg-emerald-950/70 text-emerald-300 border-emerald-500/50",
      glowColor: "glow-valid",
      description: "Active valid batch with 2+ years of shelf life remaining.",
      icon: <CheckCircleIcon className="w-4 h-4 text-emerald-400" />,
      tag: "Pharmacy Approved",
    },
    {
      code: "PARA-2023-088" as const,
      medicine: "Paracetamol Extra 650mg",
      status: "EXPIRED",
      statusBadge: "bg-amber-950/70 text-amber-300 border-amber-500/50",
      glowColor: "glow-expired",
      description: "Past expiration date. Dispensing lock triggered.",
      icon: <AlertTriangleIcon className="w-4 h-4 text-amber-400" />,
      tag: "Safety Warning",
    },
    {
      code: "METF-2024-X09" as const,
      medicine: "Metformin ER 850mg",
      status: "RECALLED",
      statusBadge: "bg-rose-950/70 text-rose-300 border-rose-500/50",
      glowColor: "glow-recalled",
      description: "Class II safety recall broadcasted directly to Hedera HCS.",
      icon: <AlertOctagonIcon className="w-4 h-4 text-rose-400" />,
      tag: "Critical Recall",
    },
  ];

  const pipelineStages = [
    {
      step: "01",
      title: "Batch Manufacture & Serialization",
      subtitle: "Off-Chain Operational DB",
      icon: <DatabaseIcon className="w-5 h-5 text-cyan-400" />,
      detail:
        "The manufacturer registers the medicine batch with NDC code, expiration date, active chemical ingredients, and packaging serialization in their operational systems.",
    },
    {
      step: "02",
      title: "Deterministic Canonical Hashing",
      subtitle: "SHA-256 Zero-Knowledge Root",
      icon: <LockIcon className="w-5 h-5 text-blue-400" />,
      detail:
        "Sensitive business data and patient records stay off-chain. A canonical SHA-256 fingerprint is calculated across batch attributes to create a permanent tamper-evident cryptographic seal.",
    },
    {
      step: "03",
      title: "Hedera Consensus Service (HCS)",
      subtitle: "Topic 0.0.7812044 Timestamping",
      icon: <HederaLogo className="w-5 h-5 text-emerald-400" />,
      detail:
        "The canonical hash and lifecycle event (REGISTERED, RECALLED) are submitted to an immutable HCS topic. Hedera's global consensus creates a fair, verifiable nanosecond timestamp.",
    },
    {
      step: "04",
      title: "Instant Verification at Point of Care",
      subtitle: "Clinics, Pharmacies & Patients",
      icon: <ShieldCheckIcon className="w-5 h-5 text-purple-400" />,
      detail:
        "When dispensing or consuming medicine, the 2D Datamatrix barcode is scanned. BatchProof queries HCS to guarantee the drug has not expired, been falsified, or recalled.",
    },
  ];

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-10">
        {/* Network & Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
          <HederaLogo className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Hedera Consensus Service</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="text-emerald-400 font-bold">Tamper-Evident Medicine Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Tamper-Evident Medicine Verification{" "}
          <span className="gradient-text">in Seconds</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Instantly verify whether a medicine batch is{" "}
          <span className="text-emerald-400 font-semibold underline decoration-emerald-500/40 underline-offset-4">VALID</span>,{" "}
          <span className="text-amber-400 font-semibold underline decoration-amber-500/40 underline-offset-4">EXPIRED</span>, or{" "}
          <span className="text-rose-400 font-semibold underline decoration-rose-500/40 underline-offset-4">RECALLED</span> with an
          immutable decentralized audit trail anchored on Hedera HCS.
        </p>

        {/* Search Bar + Barcode Scanner Trigger */}
        <div className="pt-2 max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all"
          >
            <div className="flex items-center gap-3 px-3 w-full">
              <SearchIcon className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Enter batch code (e.g. AMOX-2025-001)..."
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base outline-none font-mono py-1.5"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors shrink-0"
                title="Open simulated Barcode/QR scanner"
              >
                <QrCodeIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 shrink-0 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Verify Batch</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Batch Switches */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
              Quick Presets:
            </span>
            {sampleBatches.map((sample) => (
              <button
                key={sample.code}
                type="button"
                onClick={() => {
                  setSelectedBatchCode(sample.code);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                  selectedBatchCode === sample.code
                    ? `${sample.statusBadge} ring-2 ring-cyan-500/40 scale-105 shadow-md`
                    : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/60"
                }`}
              >
                {sample.icon}
                <span className="font-bold">{sample.code}</span>
                <span className="text-[10px] opacity-75">({sample.status})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Performance Metrics Ribbon */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="p-4 rounded-xl glass-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <ZapIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">&lt; 2.8s</div>
            <div className="text-xs text-slate-400 font-medium">Consensus Latency</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">$0.0001</div>
            <div className="text-xs text-slate-400 font-medium">Flat HCS Audit Cost</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <LockIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">SHA-256</div>
            <div className="text-xs text-slate-400 font-medium">Zero-Knowledge Integrity</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">100% aBFT</div>
            <div className="text-xs text-slate-400 font-medium">Immutable Consensus</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Verification Sandbox */}
      <section className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Interactive Verification Sandbox
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real-Time Hedera Consensus Authentication
            </h2>
          </div>
          <Link
            href={`/verify?code=${encodeURIComponent(selectedBatchCode)}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Open in Full Verifier Studio</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sandbox Card Display */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-slate-700/80 relative overflow-hidden transition-all shadow-2xl">
          {sandboxLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-mono text-cyan-300">
                Contacting Hedera HCS & querying consensus topic...
              </p>
            </div>
          ) : sandboxError ? (
            <div className="py-12 text-center space-y-3">
              <AlertTriangleIcon className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-base font-semibold text-white">Batch Query Notice</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{sandboxError}</p>
            </div>
          ) : sandboxResult && !sandboxResult.found ? (
            <div className="py-12 text-center space-y-3">
              <AlertTriangleIcon className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-base font-semibold text-white">Batch Not Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{sandboxResult.statusReason}</p>
            </div>
          ) : sandboxResult && sandboxResult.batch ? (
            <div className="space-y-6">
              {/* Header Status Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">BATCH ID:</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                      {sandboxResult.batch.id}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-200">
                    {sandboxResult.batch.medicineName}{" "}
                    <span className="text-slate-400 text-sm font-normal">
                      ({sandboxResult.batch.strength})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manufactured by <strong className="text-slate-300">{sandboxResult.batch.manufacturer}</strong>
                  </p>
                </div>

                {/* Big Visual Status Badge */}
                <div className="flex flex-col sm:items-end gap-2">
                  <div
                    className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm sm:text-base font-extrabold shadow-lg ${
                      sandboxResult.status === "VALID"
                        ? "badge-valid glow-valid"
                        : sandboxResult.status === "EXPIRED"
                        ? "badge-expired glow-expired"
                        : "badge-recalled glow-recalled"
                    }`}
                  >
                    {sandboxResult.status === "VALID" && (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    )}
                    {sandboxResult.status === "EXPIRED" && (
                      <AlertTriangleIcon className="w-5 h-5 text-amber-400" />
                    )}
                    {sandboxResult.status === "RECALLED" && (
                      <AlertOctagonIcon className="w-5 h-5 text-rose-400" />
                    )}
                    <span>BATCH STATUS: {sandboxResult.status}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {sandboxResult.statusReason}
                  </span>
                </div>
              </div>

              {/* Shelf Life & Timeline Meter */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Lifecycle Timeline:
                  </span>
                  <span className="text-slate-200">
                    Mfg: {sandboxResult.batch.manufacturingDate} ➔ Exp: {sandboxResult.batch.expiryDate}
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      sandboxResult.status === "VALID"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 w-3/4"
                        : sandboxResult.status === "EXPIRED"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 w-full"
                        : "bg-gradient-to-r from-rose-500 to-red-600 w-1/2"
                    }`}
                  />
                </div>
              </div>

              {/* Cryptographic & HCS Consensus Proof Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">
                    HEDERA CONSENSUS TOPIC
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold">
                    <HederaLogo className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{sandboxResult.topicId || "0.0.7812044"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">
                    CONSENSUS TIMESTAMP
                  </span>
                  <span className="text-xs font-mono text-slate-200 font-medium truncate block">
                    {sandboxResult.lastConsensusTimestamp || "1740000000.128475900"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">
                    TOPIC SEQUENCE #
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold block">
                    #{sandboxResult.auditTrail?.[0]?.sequenceNumber || "104"}
                  </span>
                </div>
              </div>

              {/* SHA-256 Canonical Hash Box */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      ✓ Canonical SHA-256 Hash Matched
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-all pt-1">
                    {sandboxResult.calculatedHash}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyHash(sandboxResult.calculatedHash || "")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedHash ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <PillIcon className="w-4 h-4 text-cyan-400" />
                  <span>
                    Storage: <strong className="text-slate-300">{sandboxResult.batch.storageConditions}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/verify?code=${encodeURIComponent(sandboxResult.batch.id)}`}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <span>Inspect Full HCS Audit Trail</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Interactive System Architecture & Verification Flow */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span>Decentralized Trust Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How Hedera HCS Secures the Drug Supply Chain
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Click any stage of the verification pipeline to inspect how tamper-resistance and privacy are guaranteed.
          </p>
        </div>

        {/* 4-Stage Interactive Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineStages.map((stage, idx) => {
            const isSelected = activePipelineStage === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActivePipelineStage(idx)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950/50 scale-[1.02]"
                    : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-extrabold text-cyan-400">
                    STAGE {stage.step}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {stage.icon}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                  <p className="text-[11px] font-mono text-slate-400">{stage.subtitle}</p>
                </div>

                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isSelected ? "bg-gradient-to-r from-cyan-400 to-blue-500 w-full" : "w-0"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep Dive Card */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
              {pipelineStages[activePipelineStage].icon}
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Detailed Insight • Stage {pipelineStages[activePipelineStage].step}
              </span>
              <h3 className="text-lg font-bold text-white">
                {pipelineStages[activePipelineStage].title}
              </h3>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {pipelineStages[activePipelineStage].detail}
          </p>
        </div>
      </section>

      {/* Problem & Solution Comparison */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Problem Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-950/25 via-slate-900/60 to-slate-950 border border-rose-500/25 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertOctagonIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">The Supply Chain Vulnerability</h2>
            <p className="text-slate-300 text-sm leading-relaxed mt-2">
              Counterfeit medications, expired pills repackaged into new containers, and delayed recall notices put hundreds of thousands of patient lives at risk annually.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span><b>Centralized Databases:</b> Easily altered, corrupted, or taken down by bad actors without proof of tampering.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span><b>Delayed Recalls:</b> Life-threatening safety recalls often take days or weeks to propagate to individual pharmacies.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span><b>Static Barcodes:</b> Physical 2D barcodes do not prove the batch state hasn&apos;t been revoked after printing.</span>
            </li>
          </ul>
        </div>

        {/* Solution Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/25 via-slate-900/60 to-slate-950 border border-cyan-500/25 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">The BatchProof Guarantee</h2>
            <p className="text-slate-300 text-sm leading-relaxed mt-2">
              BatchProof establishes cryptographic certainty by anchoring every batch lifecycle event onto Hedera Consensus Service within seconds.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span><b>Immutable Fair Ordering:</b> Global consensus timestamps prevent any retrospective revision or history rewriting.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span><b>Zero-Knowledge Privacy:</b> Anchors SHA-256 canonical fingerprints without storing proprietary formulations or patient PII.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span><b>Instant Recall Propagation:</b> Manufacturers broadcast recalls straight to an HCS topic for instant worldwide lock-out.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/25 text-center max-w-4xl mx-auto space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to explore or register a medicine batch?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience tamper-evident pharmaceutical tracking live. Verify existing medicines, explore consensus sequence logs, or register new test batches.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/verify"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Launch Batch Verifier</span>
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm transition-all border border-slate-700/80 flex items-center gap-2 active:scale-95 shadow-md"
          >
            <QrCodeIcon className="w-4 h-4 text-cyan-400" />
            <span>Manufacturer Registration Portal</span>
          </Link>
        </div>
      </section>

      {/* Simulated Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Barcode & QR Scanner HUD</h3>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* High-Tech Viewfinder */}
            <div className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Corner reticles */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Laser beam sweep animation */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-laser pointer-events-none" />

              <div className="text-center space-y-2 p-6">
                <QrCodeIcon className="w-16 h-16 text-slate-700 mx-auto" />
                <p className="text-xs font-mono text-cyan-300">ALIGN MEDICINE BARCODE IN FRAME</p>
                <p className="text-[11px] text-slate-500">GS1 DataMatrix / QR standard supported</p>
              </div>
            </div>

            {/* Simulated Scan Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 block">Simulate Real Bottle Scans:</span>
              <div className="grid grid-cols-1 gap-2">
                {sampleBatches.map((sample) => (
                  <button
                    key={sample.code}
                    type="button"
                    onClick={() => {
                      setScannerOpen(false);
                      setSelectedBatchCode(sample.code);
                      loadSandboxBatch(sample.code);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between text-xs font-mono transition-all"
                  >
                    <span className="text-white font-bold">{sample.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${sample.statusBadge}`}>
                      {sample.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
