"use client";

import type { SnapRewardData } from "../types";
import { ShareButton } from "@/neynar-farcaster-sdk/mini";
import { VestingChart } from "./vesting-chart";

type Props = {
  data: SnapRewardData;
  onRefresh: () => void;
};

function formatSnap(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export function RewardDashboard({ data, onRefresh }: Props) {
  const claimPercent = Math.round((data.claimedSnap / data.totalSnap) * 100) || 0;
  const vestPercent = Math.round((data.vestingSnap / data.totalSnap) * 100) || 0;
  const hasTokens = data.totalSnap > 0;

  // Derive full address from displayName (which stores truncated form)
  const fullAddress = data.pfpUrl.includes("dicebear")
    ? data.displayName.replace("...", "")
    : data.displayName;

  return (
    <div className="space-y-4">
      {/* Wallet Identity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] p-5">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          {/* Identicon avatar */}
          <div className="relative shrink-0">
            <img
              src={data.pfpUrl}
              alt="wallet"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/identicon/svg?seed=${data.displayName}`;
              }}
            />
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0a12] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-black text-lg leading-tight truncate">
                {data.displayName}
              </h2>
              <button
                onClick={onRefresh}
                className="shrink-0 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all active:scale-90"
                title="Refresh"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1 font-mono break-all leading-tight">
              {data.username}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#60a5fa"/>
                </svg>
              </div>
              <span className="text-blue-400/70 text-[10px] font-semibold uppercase tracking-wider">Ethereum L1</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-yellow-400 font-black text-3xl leading-tight tabular-nums">
              {hasTokens ? formatSnap(data.totalSnap) : "0"}
            </div>
            <p className="text-white/50 text-xs font-semibold mt-1 tracking-wide">$SNAP</p>
          </div>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Claimed - Emerald */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 p-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Claimed</p>
          </div>
          <p className="text-white font-black text-2xl leading-tight tabular-nums">
            {formatSnap(data.claimedSnap)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all" style={{ width: `${claimPercent}%` }} />
            </div>
            <span className="text-emerald-400/70 text-xs font-bold tabular-nums">{claimPercent}%</span>
          </div>
        </div>

        {/* Vesting - Amber */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25 p-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fbbf24" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Vesting</p>
          </div>
          <p className="text-white font-black text-2xl leading-tight tabular-nums">
            {formatSnap(data.vestingSnap)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all" style={{ width: `${vestPercent}%` }} />
            </div>
            <span className="text-amber-400/70 text-xs font-bold tabular-nums">{vestPercent}%</span>
          </div>
        </div>
      </div>

      {/* Combined Progress Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-white/70 text-sm font-semibold">Total Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">{formatSnap(data.claimedSnap)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-xs font-medium">{formatSnap(data.vestingSnap)}</span>
            </div>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-4 bg-white/5 rounded-xl overflow-hidden flex">
          {data.totalSnap > 0 ? (
            <>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${claimPercent}%` }}
              >
                {claimPercent > 15 && (
                  <span className="text-[10px] font-bold text-black/70 tabular-nums">{claimPercent}%</span>
                )}
              </div>
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 flex items-center justify-start pl-2"
                style={{ width: `${vestPercent}%` }}
              >
                {vestPercent > 15 && (
                  <span className="text-[10px] font-bold text-black/70 tabular-nums">{vestPercent}%</span>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <span className="text-white/30 text-xs">No tokens yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Vesting Chart */}
      {data.vestingSchedule.length > 0 && (
        <VestingChart
          schedule={data.vestingSchedule}
          totalVesting={data.vestingSnap}
        />
      )}

      {/* Vesting Schedule Detail */}
      {data.vestingSchedule.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5">
          <p className="text-white/70 text-sm font-bold mb-4 uppercase tracking-wider">Vesting Schedule</p>
          <div className="space-y-3">
            {data.vestingSchedule.map((milestone, idx) => (
              <div key={milestone.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      milestone.unlocked
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : "bg-white/5 border border-white/15 text-white/30"
                    }`}>
                      {milestone.unlocked ? "✓" : idx + 1}
                    </div>
                    {idx < data.vestingSchedule.length - 1 && (
                      <div className={`w-0.5 h-4 ${milestone.unlocked ? "bg-emerald-500/30" : "bg-white/5"}`} />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${milestone.unlocked ? "text-white" : "text-white/40"}`}>
                      {milestone.label}
                    </p>
                    <p className="text-white/25 text-xs font-mono">{milestone.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-base tabular-nums ${
                    milestone.unlocked ? "text-emerald-400" : "text-amber-400/50"
                  }`}>
                    {formatSnap(milestone.amount)}
                  </p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                    milestone.unlocked ? "text-emerald-400/60" : "text-white/20"
                  }`}>
                    {milestone.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tokens State */}
      {!hasTokens && (
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-white/50 text-sm font-medium">Belum punya $SNAP?</p>
          <p className="text-white/30 text-xs mt-1 max-w-[200px] mx-auto">
            Partisipasi di ekosistem Farcaster untuk mendapatkan reward SNAP
          </p>
        </div>
      )}

      {/* Share Button */}
      {hasTokens && (
        <ShareButton
          text={`My $SNAP: ${formatSnap(data.claimedSnap)} diklaim, ${formatSnap(data.vestingSnap)} vesting 🟡`}
          queryParams={{
            address: data.username,
            claimed: data.claimedSnap.toString(),
            vesting: data.vestingSnap.toString(),
          }}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-yellow-400/15 to-amber-500/15 border border-yellow-400/30 text-yellow-400 font-bold hover:from-yellow-400/25 hover:to-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/5"
          variant="ghost"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
          </svg>
          Share Reward
        </ShareButton>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-white/20 text-xs">
          Updated: {new Date(data.lastUpdated).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })} · Ethereum L1
        </p>
      </div>
    </div>
  );
}
