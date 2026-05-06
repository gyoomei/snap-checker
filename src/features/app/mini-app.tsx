"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { RewardDashboard } from "@/features/snap/components/reward-dashboard";
import { getSnapRewardForAddress } from "@/features/snap/api";
import type { SnapRewardData, SearchState } from "@/features/snap/types";

export function MiniApp() {
  const { address, isConnected } = useAccount();
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [rewardData, setRewardData] = useState<SnapRewardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      setWalletReady(true);
      handleCheckMyWallet();
    } else {
      setWalletReady(false);
      setRewardData(null);
      setSearchState("idle");
    }
  }, [address, isConnected]);

  async function handleCheckMyWallet() {
    if (!address) return;

    setSearchState("loading");
    setErrorMsg(null);
    setRewardData(null);

    try {
      const data = await getSnapRewardForAddress(address);
      if (data) {
        setRewardData(data);
        setSearchState("success");
      } else {
        setErrorMsg("Wallet tidak ditemukan.");
        setSearchState("error");
      }
    } catch {
      setErrorMsg("Gagal mengambil data. Coba lagi.");
      setSearchState("error");
    }
  }

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#0a0a12]">
      {/* Header */}
      <header className="shrink-0 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-yellow-400/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#0a0a12" opacity="0.3"/>
                <circle cx="12" cy="12" r="6" fill="#facc15"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-tight tracking-tight">
                $SNAP Checker
              </h1>
              <p className="text-white/40 text-xs">HyperSnap Rewards</p>
            </div>
          </div>

          {/* Wallet Status */}
          {isConnected && address && (
            <button
              onClick={handleCheckMyWallet}
              className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-1.5 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Refresh"
            >
              <div className={`w-2 h-2 rounded-full ${walletReady ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
              <span className="text-emerald-400 text-xs font-mono font-medium">
                {truncateAddress(address)}
              </span>
            </button>
          )}
          {!isConnected && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
              <span className="text-white/40 text-xs font-medium">Connecting...</span>
            </div>
          )}
        </div>

        {/* Chain Badge */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider">Ethereum L1</span>
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="shrink-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* IDLE — waiting for wallet */}
        {searchState === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 pb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/20 flex items-center justify-center shadow-2xl shadow-yellow-400/10">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#facc15" opacity="0.9"/>
                  <circle cx="12" cy="12" r="6" fill="#0a0a12" opacity="0.4"/>
                  <circle cx="12" cy="12" r="3" fill="#facc15"/>
                </svg>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-yellow-400/10 blur-xl -z-10" />
            </div>

            <div>
              <p className="text-white font-bold text-xl">$SNAP Checker</p>
              <p className="text-white/40 text-sm mt-2 max-w-[260px] mx-auto leading-relaxed">
                {isConnected
                  ? "Memuat data wallet kamu..."
                  : "Hubungkan wallet untuk melihat reward $SNAP"}
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                { icon: "⚡", text: "Real-time" },
                { icon: "🔗", text: "On-chain" },
                { icon: "📊", text: "Vesting" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <span className="text-sm">{icon}</span>
                  <span className="text-white/60 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {searchState === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <span className="w-8 h-8 border-3 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin block" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-yellow-400/10 blur-xl -z-10" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base">Membaca blockchain...</p>
              <p className="text-white/40 text-sm mt-1">Fetching from Ethereum mainnet</p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {searchState === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl">
              😕
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Ups!</p>
              <p className="text-white/50 text-sm mt-2 max-w-[220px]">
                {errorMsg ?? "Terjadi kesalahan saat mengambil data"}
              </p>
            </div>
            <button
              onClick={handleCheckMyWallet}
              className="mt-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {searchState === "success" && rewardData && (
          <RewardDashboard data={rewardData} onRefresh={handleCheckMyWallet} />
        )}
      </main>
    </div>
  );
}
