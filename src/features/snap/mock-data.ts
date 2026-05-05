import type { SnapRewardData } from "./types";

export const MOCK_REWARDS: Record<string, SnapRewardData> = {
  dwr: {
    username: "dwr",
    displayName: "Dan Romero",
    pfpUrl: "https://i.imgur.com/NyTrVuD.jpg",
    fid: 3,
    totalSnap: 125000,
    claimedSnap: 45000,
    vestingSnap: 80000,
    vestingPercent: 36,
    lastUpdated: "2026-05-05T00:00:00Z",
    vestingSchedule: [
      { label: "Q1 2026", date: "2026-03-31", amount: 20000, unlocked: true },
      { label: "Q2 2026", date: "2026-06-30", amount: 20000, unlocked: false },
      { label: "Q3 2026", date: "2026-09-30", amount: 20000, unlocked: false },
      { label: "Q4 2026", date: "2026-12-31", amount: 20000, unlocked: false },
    ],
  },
  v: {
    username: "v",
    displayName: "Varun Srinivasan",
    pfpUrl: "https://i.imgur.com/g3JOlnr.jpg",
    fid: 2,
    totalSnap: 98500,
    claimedSnap: 32000,
    vestingSnap: 66500,
    vestingPercent: 32.5,
    lastUpdated: "2026-05-05T00:00:00Z",
    vestingSchedule: [
      { label: "Q1 2026", date: "2026-03-31", amount: 16625, unlocked: true },
      { label: "Q2 2026", date: "2026-06-30", amount: 16625, unlocked: false },
      { label: "Q3 2026", date: "2026-09-30", amount: 16625, unlocked: false },
      { label: "Q4 2026", date: "2026-12-31", amount: 16625, unlocked: false },
    ],
  },
  default: {
    username: "farcaster",
    displayName: "Farcaster",
    pfpUrl: "https://i.imgur.com/I2rEbPF.png",
    fid: 1,
    totalSnap: 50000,
    claimedSnap: 12500,
    vestingSnap: 37500,
    vestingPercent: 25,
    lastUpdated: "2026-05-05T00:00:00Z",
    vestingSchedule: [
      { label: "Q1 2026", date: "2026-03-31", amount: 9375, unlocked: true },
      { label: "Q2 2026", date: "2026-06-30", amount: 9375, unlocked: false },
      { label: "Q3 2026", date: "2026-09-30", amount: 9375, unlocked: false },
      { label: "Q4 2026", date: "2026-12-31", amount: 9375, unlocked: false },
    ],
  },
};

export function getMockReward(username: string): SnapRewardData | null {
  const key = username.toLowerCase().replace("@", "");
  if (key in MOCK_REWARDS) return MOCK_REWARDS[key];
  // Return a generated mock for any other username
  const seed = key.charCodeAt(0) * 1000 + key.length * 137;
  const total = 10000 + (seed % 90000);
  const claimed = Math.floor(total * (0.1 + (seed % 40) / 100));
  const vesting = total - claimed;
  return {
    username: key,
    displayName: key.charAt(0).toUpperCase() + key.slice(1),
    pfpUrl: `https://api.dicebear.com/9.x/identicon/svg?seed=${key}`,
    fid: 1000 + (seed % 9000),
    totalSnap: total,
    claimedSnap: claimed,
    vestingSnap: vesting,
    vestingPercent: Math.round((claimed / total) * 100),
    lastUpdated: "2026-05-05T00:00:00Z",
    vestingSchedule: [
      {
        label: "Q1 2026",
        date: "2026-03-31",
        amount: Math.floor(vesting / 4),
        unlocked: true,
      },
      {
        label: "Q2 2026",
        date: "2026-06-30",
        amount: Math.floor(vesting / 4),
        unlocked: false,
      },
      {
        label: "Q3 2026",
        date: "2026-09-30",
        amount: Math.floor(vesting / 4),
        unlocked: false,
      },
      {
        label: "Q4 2026",
        date: "2026-12-31",
        amount: Math.floor(vesting / 4),
        unlocked: false,
      },
    ],
  };
}
