import React from "react";
import { BatchAuditEvent } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { CopyIcon } from "./Icons";

interface AuditTimelineProps {
  events: BatchAuditEvent[];
  showBatchId?: boolean;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  events,
  showBatchId = false,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No Hedera audit events recorded yet for this query.
      </div>
    );
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case "BATCH_REGISTERED":
        return { label: "Batch Registered", color: "text-emerald-400", dot: "bg-emerald-400" };
      case "BATCH_UPDATED":
        return { label: "Batch Record Updated", color: "text-cyan-400", dot: "bg-cyan-400" };
      case "BATCH_RECALLED":
        return { label: "Batch Recalled", color: "text-rose-400", dot: "bg-rose-400" };
      default:
        return { label: type, color: "text-slate-400", dot: "bg-slate-400" };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((event, index) => {
        const meta = getEventLabel(event.eventType);
        return (
          <div key={event.id || `${event.batchId}-${index}`} className="relative group">
            {/* Timeline node dot */}
            <span
              className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full ${meta.dot} border-2 border-slate-950 shadow-sm`}
            />

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${meta.color}`}>
                    {meta.label}
                  </span>
                  {showBatchId && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                      {event.batchId}
                    </span>
                  )}
                  <StatusBadge status={event.status} size="sm" showIcon={false} />
                  {event.isSimulatedDemo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 font-medium">
                      Demo Simulated
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>

              {event.reason && (
                <div className="mb-2.5 p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold">Recall Reason: </span>
                  {event.reason}
                </div>
              )}

              {/* On-chain HCS metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-500">Record Hash (SHA-256): </span>
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="truncate">{event.recordHash}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(event.recordHash, `hash-${event.id}`)}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                      title="Copy full hash"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                    {copiedId === `hash-${event.id}` && (
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Issuer Account ID: </span>
                  <div className="text-slate-300">{event.issuerAccountId}</div>
                </div>

                {event.topicId && (
                  <div>
                    <span className="text-slate-500">HCS Topic ID: </span>
                    <span className="text-cyan-400">{event.topicId}</span>
                  </div>
                )}

                {event.sequenceNumber !== undefined && (
                  <div>
                    <span className="text-slate-500">Consensus Sequence: </span>
                    <span className="text-slate-300">#{event.sequenceNumber}</span>
                  </div>
                )}

                {event.transactionId && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Hedera Tx ID: </span>
                    <span className="text-slate-300 break-all">{event.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
