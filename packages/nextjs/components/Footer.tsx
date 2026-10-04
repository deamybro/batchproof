import React from "react";
import Link from "next/link";
import { ShieldCheckIcon, HederaLogo } from "./Icons";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/70 text-slate-400 text-xs py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">
                Batch<span className="text-cyan-400">Proof</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              A medicine-batch verification scaffold built on the Hedera Consensus
              Service (HCS). Providing instant, tamper-evident audit trails for
              pharmacists and consumers worldwide.
            </p>
            <div className="flex items-center gap-2 text-slate-500 pt-1">
              <HederaLogo className="w-4 h-4 text-emerald-400" />
              <span>Powered by Hedera Hashgraph • Consensus at the speed of trust</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Overview & Problem
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-cyan-400 transition-colors">
                  Batch Verification
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyan-400 transition-colors">
                  Register & Recall Batch
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-cyan-400 transition-colors">
                  Hedera Audit Log
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture / Privacy */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-sm">Privacy & Security</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Append-only HCS topic</li>
              <li>• SHA-256 canonical hashing</li>
              <li>• Zero patient / PII on-chain</li>
              <li>• Transparent tamper detection</li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p className="max-w-3xl leading-relaxed">
            <span className="font-semibold text-slate-400">Disclaimer: </span>
            BatchProof is an open-source technical prototype and verification template. It
            verifies that a given batch code matches the canonical record and lifecycle status
            anchored by the issuing manufacturer to Hedera Consensus Service. It does not
            constitute official regulatory certification, laboratory chemical analysis, or an
            absolute guarantee of physical drug authenticity.
          </p>
          <div className="shrink-0 text-slate-500">
            MIT Licensed • Scaffold-HBAR
          </div>
        </div>
      </div>
    </footer>
  );
};
