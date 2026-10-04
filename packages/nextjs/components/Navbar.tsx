"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheckIcon,
  HederaLogo,
  MenuIcon,
  CloseIcon,
  CopyIcon,
  CheckIcon,
} from "./Icons";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedTopic, setCopiedTopic] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    demoMode: boolean;
    network: string;
    topicId: string | null;
  }>({
    demoMode: true,
    network: "testnet",
    topicId: null,
  });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.hedera) {
          setNetworkInfo({
            demoMode: data.hedera.demoMode,
            network: data.hedera.network || "testnet",
            topicId: data.hedera.topicId || "0.0.7812044",
          });
        }
      })
      .catch(() => {
        // Fallback to default demo mode
      });
  }, []);

  const copyTopicId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const topic = networkInfo.topicId || "0.0.7812044";
    navigator.clipboard.writeText(topic);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/verify", label: "Verify Batch" },
    { href: "/admin", label: "Register & Recall" },
    { href: "/history", label: "Audit History" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all">
            <ShieldCheckIcon className="w-5 h-5 drop-shadow" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                Batch<span className="text-cyan-400">Proof</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/70 shadow-sm">
                HCS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              Hedera Pharmaceutical Audit Trail
            </p>
          </div>
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Network & Topic Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          {networkInfo.topicId && (
            <button
              onClick={copyTopicId}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Click to copy Hedera Consensus Topic ID"
            >
              <span className="text-slate-500">Topic:</span>
              <span className="text-cyan-300 font-bold">{networkInfo.topicId}</span>
              {copiedTopic ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CopyIcon className="w-3 h-3 text-slate-400 hover:text-white" />
              )}
            </button>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border shadow-sm ${
              networkInfo.demoMode
                ? "bg-indigo-950/70 border-indigo-500/40 text-indigo-300"
                : "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
            }`}
          >
            <HederaLogo className="w-3.5 h-3.5 text-emerald-400" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold">
              {networkInfo.demoMode ? "TESTNET (Demo)" : `Hedera ${networkInfo.network.toUpperCase()}`}
            </span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <HederaLogo className="w-3.5 h-3.5 text-emerald-400" />
              HCS Topic: {networkInfo.topicId || "0.0.7812044"}
            </span>
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>
      )}
    </header>
  );
};
