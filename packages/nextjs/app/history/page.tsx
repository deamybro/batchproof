"use client";

import React, { useEffect, useState } from "react";
import {
  ClockIcon,
  SearchIcon,
  HederaLogo,
  AlertOctagonIcon,
  CopyIcon,
} from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { BatchAuditEvent } from "@/lib/types";

export default function HistoryPage() {
  const [events, setEvents] = useState<BatchAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hedera/topic");
      const data = await res.json();
      if (data.success && data.latestEvents) {
        setEvents(data.latestEvents);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      searchFilter === "" ||
      evt.batchId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      evt.recordHash.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (evt.transactionId && evt.transactionId.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesType = typeFilter === "ALL" || evt.eventType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <HederaLogo className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hedera Consensus Service (HCS) Audit Trail</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Verification & Event Audit Log
        </h1>
        <p className="text-slate-400 text-sm">
          Chronological, tamper-evident log of all batch registrations, updates, and safety recalls sequenced by Hedera consensus nodes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by batch ID, hash, or Tx..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Event Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Events</option>
            <option value="BATCH_REGISTERED">BATCH_REGISTERED</option>
            <option value="BATCH_UPDATED">BATCH_UPDATED</option>
            <option value="BATCH_RECALLED">BATCH_RECALLED</option>
          </select>

          <button
            type="button"
            onClick={fetchHistory}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <ClockIcon className="w-4 h-4 text-cyan-400" />
            <span>Sequenced Audit Records ({filteredEvents.length})</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Topic ID: {events[0]?.topicId || "0.0.7812044"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Loading Hedera audit trail...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No audit events found matching current filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, idx) => (
              <div
                key={event.id || `${event.batchId}-${idx}`}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 space-y-3 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        event.eventType === "BATCH_REGISTERED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : event.eventType === "BATCH_RECALLED"
                          ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                          : "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
                      }`}
                    >
                      {event.eventType}
                    </span>
                    <a
                      href={`/verify?code=${event.batchId}`}
                      className="font-mono font-bold text-white hover:text-cyan-400 text-xs sm:text-sm underline decoration-slate-600 underline-offset-4"
                      title="Inspect Batch Verification Record"
                    >
                      {event.batchId}
                    </a>
                    <StatusBadge status={event.status} size="sm" showIcon={false} />
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    {event.sequenceNumber !== undefined && (
                      <span className="text-cyan-400 font-semibold">
                        Seq #{event.sequenceNumber}
                      </span>
                    )}
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {event.reason && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertOctagonIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recall Notice: </span>
                      {event.reason}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500">Record Hash (SHA-256): </span>
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="truncate">{event.recordHash}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(event.recordHash, `hash-${event.id}`)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Copy hash"
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
                    <span className="text-slate-300">{event.issuerAccountId}</span>
                  </div>

                  {event.transactionId && (
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Hedera Tx ID: </span>
                      <span className="text-slate-300 break-all">{event.transactionId}</span>
                    </div>
                  )}

                  {event.consensusTimestamp && (
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Consensus Timestamp: </span>
                      <span className="text-emerald-400/90">{event.consensusTimestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
