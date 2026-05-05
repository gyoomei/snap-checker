"use client";

import { useState } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { UserSearch } from "@/features/snap/components/user-search";
import { RewardDashboard } from "@/features/snap/components/reward-dashboard";
import { getMockReward } from "@/features/snap/mock-data";
import type { SnapRewardData, SearchState } from "@/features/snap/types";

export function MiniApp() {
  const { data: currentUser } = useFarcasterUser();
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [rewardData, setRewardData] = useState<SnapRewardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch(username: string) {
    setSearchState("loading");
    setErrorMsg(null);
    setRewardData(null);

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 800));

    const data = getMockReward(username);
    if (data) {
      setRewardData(data);
      setSearchState("success");
    } else {
      setErrorMsg("User tidak ditemukan.");
      setSearchState("error");
    }
  }

  function handleCheckMine() {
    if (currentUser?.username) {
      handleSearch(currentUser.username);
    }
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#0a0a12]">
      {/* Header */}
      <header className="shrink-0 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-xl shrink-0">
            🟡
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight tracking-tight">
              $SNAP Checker
            </h1>
            <p className="text-white/40 text-xs">Cek reward Farcaster kamu</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="shrink-0 px-4 pb-4 space-y-2">
        <UserSearch onSearch={handleSearch} searchState={searchState} />
        {currentUser?.username && searchState === "idle" && (
          <button
            onClick={handleCheckMine}
            className="w-full h-10 rounded-xl border border-yellow-400/20 text-yellow-400/70 text-sm font-medium hover:bg-yellow-400/10 transition-all active:scale-[0.98]"
          >
            Cek punya saya (@{currentUser.username})
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px bg-white/8 mx-4" />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {searchState === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-4xl">
              🟡
            </div>
            <div>
              <p className="text-white font-bold text-lg">Cek Reward $SNAP</p>
              <p className="text-white/40 text-sm mt-1 max-w-[240px] mx-auto leading-relaxed">
                Masukkan username Farcaster untuk melihat reward, jumlah klaim,
                dan sisa vesting
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              {["Total $SNAP", "Sudah Klaim", "Vesting"].map((label, i) => (
                <div
                  key={label}
                  className="bg-white/5 rounded-xl p-3 border border-white/10 text-center"
                >
                  <div className="text-xl mb-1">
                    {["🪙", "✅", "🔒"][i]}
                  </div>
                  <p className="text-white/50 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchState === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <span className="w-7 h-7 border-3 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin block" />
            </div>
            <p className="text-white/50 text-sm">Mengambil data reward...</p>
          </div>
        )}

        {searchState === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-5xl">😕</div>
            <div>
              <p className="text-white font-semibold">User tidak ditemukan</p>
              <p className="text-white/40 text-sm mt-1">
                {errorMsg ?? "Coba username lain"}
              </p>
            </div>
          </div>
        )}

        {searchState === "success" && rewardData && (
          <RewardDashboard data={rewardData} />
        )}
      </main>
    </div>
  );
}
