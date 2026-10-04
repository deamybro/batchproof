import React from "react";
import { HederaLogo, ShieldCheckIcon } from "./Icons";

interface VerifiedBadgeProps {
  verified: boolean;
  topicId?: string;
  transactionId?: string;
  consensusTimestamp?: string;
  sequenceNumber?: number;
  network?: string;
  hashMatches?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  verified,
  topicId,
  transactionId,
  consensusTimestamp,
  sequenceNumber,
  network = "testnet",
  hashMatches = true,
}) => {
  if (!verified) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
        <span>Not anchored on Hedera</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900/60 border border-emerald-500/30 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-300">
            <span>Verified on Hedera Consensus Service</span>
            <HederaLogo className="w-3.5 h-3.5 text-emerald-400 inline" />
          </div>
          <div className="text-xs text-slate-400">
            Immutable audit record anchored to {network.toUpperCase()}
            {hashMatches && " • Cryptographic hash matches canonical state"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {topicId && (
          <span className="px-2 py-0.5 rounded bg-slate-800/90 text-cyan-300 border border-cyan-500/20" title="Hedera Topic ID">
            Topic: {topicId}
          </span>
        )}
        {transactionId && (
          <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700 truncate max-w-[150px]" title={`Tx ID: ${transactionId}`}>
            Tx: {transactionId}
          </span>
        )}
        {sequenceNumber !== undefined && (
          <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700" title="Consensus Sequence Number">
            Seq #{sequenceNumber}
          </span>
        )}
        {consensusTimestamp && (
          <span className="px-2 py-0.5 rounded bg-slate-800/90 text-emerald-300 border border-emerald-500/20" title="Consensus Timestamp">
            Consensus: {consensusTimestamp.length > 16 ? `${consensusTimestamp.slice(0, 16)}...` : consensusTimestamp}
          </span>
        )}
      </div>
    </div>
  );
};
