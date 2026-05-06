import type { SnapRewardData } from "./types";

// SNAP Token contract on Ethereum Mainnet
const SNAP_CONTRACT = "0x49B5a631F54927c0007232844f06FE18cbf69786" as const;
const SNAP_DECIMALS = 6;

// Ethereum public RPC
const ETH_RPC = "https://ethereum-rpc.publicnode.com";

// Contract deployment: Jan 2025 (approximate)
const VESTING_START = new Date("2025-01-01T00:00:00Z");
const CLIFF_MONTHS = 12; // 12-month cliff
const VESTING_TOTAL_MONTHS = 24; // 24-month total vesting

// ─── On-chain fetch ─────────────────────────────────────────────────────────

function balanceOfData(owner: string): string {
  const methodId = "0x70a08231"; // balanceOf(address)
  const padded = owner.toLowerCase().replace("0x", "").padStart(64, "0");
  return methodId + padded;
}

export async function getSnapBalance(ethAddress: string): Promise<number> {
  try {
    const res = await fetch(ETH_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: SNAP_CONTRACT, data: balanceOfData(ethAddress) }, "latest"],
        id: 1,
      }),
    });
    if (!res.ok) return 0;
    const json = await res.json();
    const hex = json?.result;
    if (!hex || hex === "0x" || hex === "0x0") return 0;
    return Number(BigInt(hex)) / 10 ** SNAP_DECIMALS;
  } catch {
    return 0;
  }
}

// ─── Vesting calculation ───────────────────────────────────────────────────

function buildVestingSchedule(totalSnap: number): {
  schedule: SnapRewardData["vestingSchedule"];
  vestingSnap: number;
  vestingPercent: number;
  cliffDate: Date;
  endDate: Date;
} {
  const now = new Date();

  // Cliff: 12 months after start
  const cliffDate = new Date(VESTING_START);
  cliffDate.setMonth(cliffDate.getMonth() + CLIFF_MONTHS);

  // End: 24 months after start
  const endDate = new Date(VESTING_START);
  endDate.setMonth(endDate.getMonth() + VESTING_TOTAL_MONTHS);

  // Before cliff: 0% unlocked
  // After cliff: linear unlock over remaining months
  const monthsSinceCliff = Math.max(
    0,
    (now.getTime() - cliffDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  );
  const totalVestingMonths = VESTING_TOTAL_MONTHS - CLIFF_MONTHS;
  const unlockPercent = Math.min(
    100,
    (monthsSinceCliff / totalVestingMonths) * 100
  );

  const vestedSnap = totalSnap * (unlockPercent / 100);
  const lockedSnap = totalSnap - vestedSnap;
  const vestingPercent = Math.round((lockedSnap / totalSnap) * 100) || 0;

  // Build quarterly milestones from cliff to end
  const milestones: SnapRewardData["vestingSchedule"] = [];
  const current = new Date(cliffDate);
  const quarterlyAmount = Math.floor(totalSnap / (totalVestingMonths / 3));

  for (let i = 0; i < 4; i++) {
    const label = `Q${i + 1} ${cliffDate.getFullYear()}`;
    const date = new Date(current);
    const unlocked = now >= date;
    milestones.push({ label, date: date.toISOString().split("T")[0], amount: quarterlyAmount, unlocked });
    current.setMonth(current.getMonth() + 3);
  }

  // If we passed cliff, show current progress milestone
  if (unlockPercent > 0 && unlockPercent < 100) {
    milestones[0] = {
      ...milestones[0],
      amount: Math.floor(totalSnap * (unlockPercent / 100)),
      unlocked: true,
    };
  }

  return {
    schedule: milestones.filter((m) => m.amount > 0),
    vestingSnap: Math.floor(lockedSnap),
    vestingPercent,
    cliffDate,
    endDate,
  };
}

// ─── Main API ───────────────────────────────────────────────────────────────

export async function getSnapRewardForAddress(
  ethAddress: string
): Promise<SnapRewardData | null> {
  const totalSnap = await getSnapBalance(ethAddress);

  // Wallet identity from address
  const shortAddr = `${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}`;

  if (totalSnap <= 0) {
    return {
      username: shortAddr,
      displayName: shortAddr,
      pfpUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${ethAddress}`,
      fid: 0,
      totalSnap: 0,
      claimedSnap: 0,
      vestingSnap: 0,
      vestingPercent: 0,
      lastUpdated: new Date().toISOString(),
      vestingSchedule: [],
    };
  }

  const { schedule, vestingSnap, vestingPercent } = buildVestingSchedule(totalSnap);
  const claimedSnap = totalSnap - vestingSnap;

  return {
    username: shortAddr,
    displayName: shortAddr,
    pfpUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${ethAddress}`,
    fid: 0,
    totalSnap,
    claimedSnap: Math.floor(claimedSnap),
    vestingSnap,
    vestingPercent,
    lastUpdated: new Date().toISOString(),
    vestingSchedule: schedule,
  };
}
