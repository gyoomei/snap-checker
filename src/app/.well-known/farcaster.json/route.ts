import { NextResponse } from "next/server";
import accountAssociation from "@/config/account-association.json";

export const dynamic = "force-static";

const SNAP_CONTRACT = "0x49B5a631F54927c0007232844f06FE18cbf69786";
const SNAP_NAME = "Hypersnap";
const SNAP_SYMBOL = "SNAP";
const SNAP_DECIMALS = 6;
const SNAP_ICON_URL = "https://cryptologos.cc/logos/snap-snap-logo.png?v=040";

const config = {
  accountAssociation,
  miniapp: {
    version: "1",
    name: "SNAP Checker",
    homeUrl: "https://gyoomei.github.io/snap-checker/",
    iconUrl: SNAP_ICON_URL,
    splashImageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://gyoomei.github.io/snap-checker"}/app-splash.png`,
    splashBackgroundColor: "#0a0a12",
    subtitle: "Cek reward SNAP kamu",
    description: "Cek reward SNAP token. Lihat jumlah yang sudah diklaim dan vesting. Search username.",
    primaryCategory: "utility",
    tags: ["snap", "farcaster", "rewards", "token"],
    heroImageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://gyoomei.github.io/snap-checker"}/app-hero.png`,
    tagline: "Cek reward SNAP sekarang",
    ogTitle: "SNAP Checker",
    ogDescription: "Cek reward dan vesting SNAP token",
    ogImageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://gyoomei.github.io/snap-checker"}/app-hero.png`,
    canonicalDomain: "gyoomei.github.io",
    requiredChains: ["eip155:1"],
    webhookUrl: undefined,
    tokenAddress: SNAP_CONTRACT,
    tokenName: SNAP_NAME,
    tokenSymbol: SNAP_SYMBOL,
    tokenDecimals: SNAP_DECIMALS,
  },
};

export async function GET() {
  try {
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error generating metadata:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
