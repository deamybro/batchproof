"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  AlertOctagonIcon,
  CheckCircleIcon,
  HederaLogo,
  PillIcon,
} from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { MedicineBatch } from "@/lib/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"register" | "recall">("register");
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Form states for Registration
  const [registerForm, setRegisterForm] = useState({
    id: "",
    medicineName: "",
    strength: "",
    manufacturer: "",
    manufacturingDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    storageConditions: "Store below 25°C in a dry place.",
    activeIngredients: "",
  });
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<any | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Form states for Recall
  const [recallBatchId, setRecallBatchId] = useState("");
  const [recallReason, setRecallReason] = useState("");
  const [recalling, setRecalling] = useState(false);
  const [recallSuccess, setRecallSuccess] = useState<any | null>(null);
  const [recallError, setRecallError] = useState<string | null>(null);

  const fetchBatches = async () => {
    setRefreshLoading(true);
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch {
      // silently handle
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      const payload = {
        ...registerForm,
        id: registerForm.id.trim().toUpperCase(),
        activeIngredients: registerForm.activeIngredients
          ? registerForm.activeIngredients.split(",").map((s) => s.trim()).filter(Boolean)
          : [registerForm.medicineName.trim()],
      };

      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register batch.");
      }

      setRegisterSuccess(data);
      // Reset form
      setRegisterForm({
        id: "",
        medicineName: "",
        strength: "",
        manufacturer: "",
        manufacturingDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        storageConditions: "Store below 25°C in a dry place.",
        activeIngredients: "",
      });
      fetchBatches();
    } catch (err: any) {
      setRegisterError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRecallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallBatchId.trim()) {
      setRecallError("Please select or enter a batch ID to recall.");
      return;
    }
    if (!recallReason.trim()) {
      setRecallError("Please enter a recall reason.");
      return;
    }

    setRecalling(true);
    setRecallError(null);
    setRecallSuccess(null);

    try {
      const cleanId = recallBatchId.trim().toUpperCase();
      const res = await fetch(`/api/batches/${encodeURIComponent(cleanId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recall",
          reason: recallReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit batch recall.");
      }

      setRecallSuccess(data);
      setRecallReason("");
      fetchBatches();
    } catch (err: any) {
      setRecallError(err.message || "An error occurred while publishing the recall.");
    } finally {
      setRecalling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <HederaLogo className="w-3.5 h-3.5 text-emerald-400" />
          <span>Manufacturer & Regulatory Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Batch Management & HCS Publishing
        </h1>
        <p className="text-slate-400 text-sm">
          Register new medicine production batches, anchor canonical hashes to Hedera HCS, or publish immediate safety recall broadcasts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "register"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <PillIcon className="w-4 h-4" />
          <span>Register New Batch</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recall")}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "recall"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertOctagonIcon className="w-4 h-4" />
          <span>Recall Batch</span>
        </button>
      </div>

      {/* Register Tab Content */}
      {activeTab === "register" && (
        <div className="p-6 sm:p-8 rounded-2xl glass-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Register Medicine Batch</h2>
            <p className="text-xs text-slate-400">
              Anchors a new canonical SHA-256 fingerprint to the Hedera Consensus Topic. No patient data or private formulation details are published on-chain.
            </p>
          </div>

          {registerSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Batch Successfully Anchored to Hedera HCS!</span>
              </div>
              <p className="text-xs text-emerald-200">{registerSuccess.message}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-2 border-t border-emerald-500/20">
                <div>
                  <span className="text-slate-400">Batch ID: </span>
                  <span className="font-bold text-white">{registerSuccess.batch.id}</span>
                </div>
                <div>
                  <span className="text-slate-400">HCS Topic ID: </span>
                  <span className="text-cyan-300">{registerSuccess.hcsResult.topicId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Consensus Seq: </span>
                  <span>#{registerSuccess.hcsResult.sequenceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Record Hash: </span>
                  <span className="truncate block">{registerSuccess.batch.recordHash}</span>
                </div>
              </div>
            </div>
          )}

          {registerError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              <span className="font-bold">Error: </span>
              {registerError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Batch Code / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMOX-2026-401"
                  value={registerForm.id}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, id: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin Trihydrate"
                  value={registerForm.medicineName}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, medicineName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dosage / Strength *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg Capsule"
                  value={registerForm.strength}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, strength: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Manufacturer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Healthcare Ltd."
                  value={registerForm.manufacturer}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, manufacturer: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Manufacturing Date *
                </label>
                <input
                  type="date"
                  required
                  value={registerForm.manufacturingDate}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, manufacturingDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={registerForm.expiryDate}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, expiryDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Storage Conditions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Store below 25°C in a dry place away from sunlight."
                  value={registerForm.storageConditions}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, storageConditions: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Ingredients (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin Trihydrate 500mg, Clavulanic Acid 125mg"
                  value={registerForm.activeIngredients}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, activeIngredients: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {registering ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Publishing to Hedera HCS...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Register & Publish to Hedera</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Recall Tab Content */}
      {activeTab === "recall" && (
        <div className="p-6 sm:p-8 rounded-2xl glass-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertOctagonIcon className="w-5 h-5 text-rose-400" />
              <span>Broadcast Safety Recall</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immediately updates batch status to RECALLED on the Hedera audit log. This action is broadcast to all verifiers and cannot be undone on the ledger.
            </p>
          </div>

          {recallSuccess && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertOctagonIcon className="w-5 h-5" />
                <span>Recall Broadcast Published to Hedera HCS!</span>
              </div>
              <p className="text-xs text-rose-200">{recallSuccess.message}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-2 border-t border-rose-500/20">
                <div>
                  <span className="text-slate-400">Batch ID: </span>
                  <span className="font-bold text-white">{recallSuccess.batch.id}</span>
                </div>
                <div>
                  <span className="text-slate-400">New Status: </span>
                  <span className="text-rose-400 font-bold">RECALLED</span>
                </div>
                <div>
                  <span className="text-slate-400">Hedera Tx ID: </span>
                  <span className="truncate block">{recallSuccess.hcsResult.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Consensus Seq: </span>
                  <span>#{recallSuccess.hcsResult.sequenceNumber}</span>
                </div>
              </div>
            </div>
          )}

          {recallError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              <span className="font-bold">Error: </span>
              {recallError}
            </div>
          )}

          <form onSubmit={handleRecallSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Batch or Enter Batch ID *
              </label>
              <div className="flex gap-2">
                <select
                  value={recallBatchId}
                  onChange={(e) => setRecallBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-rose-500 outline-none"
                >
                  <option value="">-- Choose registered batch --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.medicineName} ({b.isRecalled ? "ALREADY RECALLED" : "ACTIVE"})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Or type directly:{" "}
                <input
                  type="text"
                  placeholder="AMOX-..."
                  value={recallBatchId}
                  onChange={(e) => setRecallBatchId(e.target.value)}
                  className="ml-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                />
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Recall Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. FDA Class II recall due to potential cross-contamination during blister packaging process."
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-rose-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={recalling || !recallBatchId.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              {recalling ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Publishing Recall to HCS...</span>
                </>
              ) : (
                <>
                  <AlertOctagonIcon className="w-4 h-4" />
                  <span>Publish RECALL to Hedera Consensus</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Currently Registered Batches Table */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">
            Known Registered Batches ({batches.length})
          </h3>
          <button
            type="button"
            onClick={fetchBatches}
            className="text-xs text-slate-400 hover:text-white"
          >
            {refreshLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2">Batch ID</th>
                <th className="pb-2">Medicine</th>
                <th className="pb-2">Expiry Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-cyan-300 font-bold">{b.id}</td>
                  <td className="py-2.5 text-slate-300 font-sans">{b.medicineName} {b.strength}</td>
                  <td className="py-2.5 text-slate-400">{b.expiryDate}</td>
                  <td className="py-2.5 font-sans">
                    <StatusBadge
                      status={b.isRecalled ? "RECALLED" : new Date(b.expiryDate).getTime() < Date.now() ? "EXPIRED" : "VALID"}
                      size="sm"
                      showIcon={false}
                    />
                  </td>
                  <td className="py-2.5 text-right font-sans">
                    <a
                      href={`/verify?code=${b.id}`}
                      className="text-cyan-400 hover:underline mr-3 text-xs"
                    >
                      Verify
                    </a>
                    {!b.isRecalled && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("recall");
                          setRecallBatchId(b.id);
                        }}
                        className="text-rose-400 hover:underline text-xs"
                      >
                        Recall
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
