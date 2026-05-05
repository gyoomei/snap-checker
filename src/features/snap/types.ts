export type SnapRewardData = {
  username: string;
  displayName: string;
  pfpUrl: string;
  fid: number;
  totalSnap: number;
  claimedSnap: number;
  vestingSnap: number;
  vestingPercent: number;
  vestingSchedule: VestingMilestone[];
  lastUpdated: string;
};

export type VestingMilestone = {
  label: string;
  date: string;
  amount: number;
  unlocked: boolean;
};

export type SearchState = "idle" | "loading" | "success" | "error";
