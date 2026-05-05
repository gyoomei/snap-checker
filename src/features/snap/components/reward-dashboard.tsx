"use client";

import type { SnapRewardData } from "../types";
import { ShareButton } from "@/neynar-farcaster-sdk/mini";
import { VestingChart } from "./vesting-chart";

type Props = {
  data: SnapRewardData;
};

function formatSnap(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function RewardDashboard({ data }: Props) {
  const claimPercent = Math.round((data.claimedSnap / data.totalSnap) * 100);
  const vestPercent = Math.round((data.vestingSnap / data.totalSnap) * 100);

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="flex items-center gap-3 bg-white/8 rounded-2xl p-4 border border-white/10">
        <img
          src={data.pfpUrl}
          alt={data.displayName}
          className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400/50 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/identicon/svg?seed=${data.username}`;
          }}
        />
        <div className="min-w-0">
          <p className="text-white font-bold text-lg truncate leading-tight">
            {data.displayName}
          </p>
          <p className="text-yellow-400 text-sm font-medium">
            @{data.username}
          </p>
          <p className="text-white/40 text-xs mt-0.5">FID #{data.fid}</p>
        </div>
        <div className="ml-auto shrink-0 text-right">
          <p className="text-yellow-400 font-black text-xl leading-tight">
            {formatSnap(data.totalSnap)}
          </p>
          <p className="text-white/50 text-xs font-medium">Total $SNAP</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Claimed */}
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✅</span>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              Sudah Diklaim
            </p>
          </div>
          <p className="text-white font-black text-2xl leading-tight">
            {formatSnap(data.claimedSnap)}
          </p>
          <p className="text-emerald-400/70 text-xs mt-1">
            {claimPercent}% dari total
          </p>
        </div>

        {/* Vesting */}
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔒</span>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">
              Dalam Vesting
            </p>
          </div>
          <p className="text-white font-black text-2xl leading-tight">
            {formatSnap(data.vestingSnap)}
          </p>
          <p className="text-amber-400/70 text-xs mt-1">
            {vestPercent}% dari total
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/8 rounded-2xl p-4 border border-white/10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-white/70 text-sm font-medium">Progress Klaim</p>
          <p className="text-yellow-400 font-bold text-sm">{claimPercent}%</p>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-700"
            style={{ width: `${claimPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-emerald-400 text-xs">
            {formatSnap(data.claimedSnap)} diklaim
          </span>
          <span className="text-amber-400 text-xs">
            {formatSnap(data.vestingSnap)} terkunci
          </span>
        </div>
      </div>

      {/* Vesting Chart */}
      <VestingChart
        schedule={data.vestingSchedule}
        totalVesting={data.vestingSnap}
      />

      {/* Vesting Schedule Detail */}
      <div className="bg-white/8 rounded-2xl p-4 border border-white/10 space-y-3">
        <p className="text-white/70 text-sm font-semibold">Detail Jadwal</p>
        {data.vestingSchedule.map((milestone) => (
          <div
            key={milestone.label}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  milestone.unlocked
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : "bg-white/5 border border-white/15"
                }`}
              >
                {milestone.unlocked ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : (
                  <span className="text-white/30 text-[10px]">🔒</span>
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${milestone.unlocked ? "text-white" : "text-white/50"}`}
                >
                  {milestone.label}
                </p>
                <p className="text-white/30 text-xs">{milestone.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-sm tabular-nums ${
                  milestone.unlocked ? "text-emerald-400" : "text-amber-400/60"
                }`}
              >
                {formatSnap(milestone.amount)}
              </p>
              <p className="text-white/20 text-[10px]">
                {milestone.unlocked ? "unlocked" : "locked"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Share Button */}
      <ShareButton
        text={`Cek reward $SNAP @${data.username}: ${formatSnap(data.claimedSnap)} diklaim, ${formatSnap(data.vestingSnap)} dalam vesting! 🟡`}
        queryParams={{
          username: data.username,
          claimed: data.claimedSnap.toString(),
          vesting: data.vestingSnap.toString(),
        }}
        className="w-full h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 font-bold hover:bg-yellow-400/30 transition-all"
        variant="ghost"
      >
        🟡 Share Reward @{data.username}
      </ShareButton>

      <p className="text-white/20 text-xs text-center pb-2">
        Data diperbarui: {new Date(data.lastUpdated).toLocaleDateString("id-ID")} · Mock Data
      </p>
    </div>
  );
}
