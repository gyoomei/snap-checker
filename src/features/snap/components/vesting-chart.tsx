"use client";

import { useEffect, useState } from "react";
import type { VestingMilestone } from "../types";

type Props = {
  schedule: VestingMilestone[];
  totalVesting: number;
};

function formatSnap(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function VestingChart({ schedule, totalVesting }: Props) {
  const [animated, setAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const maxAmount = Math.max(...schedule.map((m) => m.amount));
  const cumulative: number[] = [];
  let running = 0;
  for (const m of schedule) {
    running += m.amount;
    cumulative.push(running);
  }
  const totalScheduled = running;

  return (
    <div className="bg-white/8 rounded-2xl p-4 border border-white/10 space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <p className="text-white/80 text-sm font-semibold">Vesting Timeline</p>
        <span className="text-yellow-400/60 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">
          {schedule.filter((m) => m.unlocked).length}/{schedule.length} unlock
        </span>
      </div>

      {/* Bar chart */}
      <div className="relative">
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: 28 }}>
          {[100, 75, 50, 25, 0].map((pct) => (
            <div
              key={pct}
              className="w-full border-t border-white/5 relative"
            >
              <span className="absolute -top-2.5 -left-1 text-white/20 text-[9px]">
                {pct === 100 ? formatSnap(maxAmount) : pct === 0 ? "0" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-2 h-36 pt-4 pb-7 pl-6">
          {schedule.map((milestone, i) => {
            const heightPct = maxAmount > 0 ? (milestone.amount / maxAmount) * 100 : 0;
            const isActive = activeIndex === i;
            const isUnlocked = milestone.unlocked;

            return (
              <div
                key={milestone.label}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer group relative"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onTouchStart={() => setActiveIndex(i)}
                onTouchEnd={() => setActiveIndex(null)}
              >
                {/* Tooltip */}
                {isActive && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 bg-[#1a1a2e] border border-white/20 rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap shadow-xl">
                    <p className="text-yellow-400 font-bold text-xs">
                      {formatSnap(milestone.amount)} SNAP
                    </p>
                    <p className="text-white/50 text-[10px]">{milestone.date}</p>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg relative overflow-hidden transition-all duration-150"
                    style={{
                      height: animated ? `${heightPct}%` : "0%",
                      minHeight: animated ? 4 : 0,
                      transition: animated
                        ? `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`
                        : "none",
                      background: isUnlocked
                        ? isActive
                          ? "linear-gradient(to top, #10b981, #34d399)"
                          : "linear-gradient(to top, #059669, #10b981)"
                        : isActive
                          ? "linear-gradient(to top, #f59e0b, #fbbf24)"
                          : "linear-gradient(to top, #d97706, #f59e0b80)",
                      opacity: isActive ? 1 : 0.85,
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg" />
                  </div>
                </div>

                {/* Label below */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <p
                    className={`text-[9px] font-medium leading-tight ${
                      isUnlocked ? "text-emerald-400" : "text-white/35"
                    }`}
                  >
                    {milestone.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cumulative progress line chart (SVG) */}
      <CumulativeProgress schedule={schedule} totalScheduled={totalScheduled} animated={animated} />

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-white/50 text-xs">Unlocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500/60" />
          <span className="text-white/50 text-xs">Locked</span>
        </div>
      </div>
    </div>
  );
}

function CumulativeProgress({
  schedule,
  totalScheduled,
  animated,
}: {
  schedule: VestingMilestone[];
  totalScheduled: number;
  animated: boolean;
}) {
  const W = 320;
  const H = 56;
  const PAD = { left: 8, right: 8, top: 8, bottom: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Build cumulative points
  const points: { x: number; y: number; unlocked: boolean; cum: number }[] = [];
  let running = 0;
  schedule.forEach((m, i) => {
    running += m.amount;
    const x = PAD.left + (i / (schedule.length - 1)) * innerW;
    const y = PAD.top + (1 - running / totalScheduled) * innerH;
    points.push({ x, y, unlocked: m.unlocked, cum: running });
  });

  // SVG path
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Area fill path
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`;

  const pathLength = 600; // approximate

  return (
    <div className="space-y-1">
      <p className="text-white/40 text-[10px] font-medium uppercase tracking-wide">
        Kumulatif Unlock
      </p>
      <div className="relative w-full" style={{ height: H }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              animated
                ? undefined
                : {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength,
                  }
            }
          />

          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={p.unlocked ? "#10b981" : "#f59e0b"}
              stroke={p.unlocked ? "#10b981" : "#f59e0b"}
              strokeWidth={2}
              fillOpacity={p.unlocked ? 1 : 0.4}
              style={{
                filter: p.unlocked ? "drop-shadow(0 0 4px #10b981)" : "none",
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
