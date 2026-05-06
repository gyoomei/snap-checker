import type { SnapRewardData } from "./types";

// SNAP Token contract on Ethereum Mainnet
const SNAP_CONTRACT = "0x49B5a631F54927c0007232844f06FE18cbf69786" as const;

// Ethereum RPC (public, no API key needed)
const ETH_RPC = "https://ethereum-rpc.publicnode.com";

// Build balanceOf call data
function balanceOfData(owner: string): string {
  const methodId = "0x70a08231"; // balanceOf(address)
  const padded = owner.toLowerCase().replace("0x", "").padStart(64, "0");
  return methodId + padded;
}

// Get SNAP balance for an ETH address
export async function getSnapBalance(ethAddress: string): Promise<number> {
  try {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: SNAP_CONTRACT,
          data: balanceOfData(ethAddress),
        },
        "latest",
      ],
      id: 1,
    });

    const res = await fetch(ETH_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) return 0;

    const json = await res.json();
    const hex = json?.result;
    if (!hex || hex === "0x") return 0;

    const balance = BigInt(hex);
    return Number(balance) / 1e6; // SNAP has 6 decimals
  } catch {
    return 0;
  }
}

// Fetch real user data from Warpcast
async function fetchUserProfile(username: string): Promise<{
  username: string;
  displayName: string;
  pfpUrl: string;
  fid: number;
} | null> {
  try {
    const res = await fetch(
      `https://api.warpcast.com/v2/user-by-username?username=${encodeURIComponent(username)}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const user = json?.result?.user;
    if (!user) return null;

    return {
      username: user.username,
      displayName: user.displayName || user.username,
      pfpUrl: user.pfp?.url || `https://api.dicebear.com/9.x/identicon/svg?seed=${user.username}`,
      fid: user.fid,
    };
  } catch {
    return null;
  }
}

// Build vesting schedule (estimated based on token distribution)
function buildVestingSchedule(totalSnap: number): {
  schedule: SnapRewardData["vestingSchedule"];
  vestingSnap: number;
  vestingPercent: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const quartersSinceStart = Math.floor(
    (now.getTime() - new Date(`${year}-01-01`).getTime()) / (90 * 24 * 60 * 60 * 1000)
  );
  const totalQuarters = 16;
  const unlockedQuarters = Math.min(Math.max(quartersSinceStart, 0), totalQuarters);
  const unlockPercent = (unlockedQuarters / totalQuarters) * 100;

  const vestingSnap = totalSnap * (1 - unlockPercent / 100);

  const schedule = [
    { label: "Q1 2025", date: `${year}-03-31`, amount: Math.floor(totalSnap * 0.0625), unlocked: quartersSinceStart >= 0 },
    { label: "Q2 2025", date: `${year}-06-30`, amount: Math.floor(totalSnap * 0.0625), unlocked: quartersSinceStart >= 1 },
    { label: "Q3 2025", date: `${year}-09-30`, amount: Math.floor(totalSnap * 0.0625), unlocked: quartersSinceStart >= 2 },
    { label: "Q4 2025", date: `${year}-12-31`, amount: Math.floor(totalSnap * 0.0625), unlocked: quartersSinceStart >= 3 },
  ];

  return {
    schedule,
    vestingSnap: Math.floor(vestingSnap),
    vestingPercent: Math.round((1 - unlockPercent / 100) * 100),
  };
}

// Get SNAP reward untuk user tertentu
export async function getSnapReward(username: string): Promise<SnapRewardData | null> {
  const profile = await fetchUserProfile(username);
  if (!profile) return null;

  return {
    ...profile,
    totalSnap: 0,
    claimedSnap: 0,
    vestingSnap: 0,
    vestingPercent: 0,
    lastUpdated: new Date().toISOString(),
    vestingSchedule: [],
  };
}

// Get SNAP reward untuk wallet address
export async function getSnapRewardForAddress(
  ethAddress: string,
  userProfile?: { username: string; displayName: string; pfpUrl: string; fid: number }
): Promise<SnapRewardData | null> {
  const totalSnap = await getSnapBalance(ethAddress);
  
  const profile = userProfile || {
    username: "unknown",
    displayName: "Unknown User",
    pfpUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${ethAddress}`,
    fid: 0,
  };

  if (totalSnap <= 0) {
    return {
      ...profile,
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
    ...profile,
    totalSnap,
    claimedSnap,
    vestingSnap,
    vestingPercent,
    lastUpdated: new Date().toISOString(),
    vestingSchedule: schedule,
  };
}
