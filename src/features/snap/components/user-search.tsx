"use client";

import { useState } from "react";
import { Button } from "@neynar/ui";
import type { SearchState } from "../types";

type Props = {
  onSearch: (username: string) => void;
  searchState: SearchState;
};

export function UserSearch({ onSearch, searchState }: Props) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().replace(/^@/, "");
    if (!trimmed) return;
    onSearch(trimmed);
  }

  const isLoading = searchState === "loading";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-base select-none">
            @
          </span>
          <input
            type="text"
            placeholder="username farcaster"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full h-12 pl-8 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-400/60 focus:bg-white/15 transition-all text-base disabled:opacity-50"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-12 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all active:scale-95 disabled:opacity-40 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Cek...
            </span>
          ) : (
            "Cek"
          )}
        </Button>
      </div>
    </form>
  );
}
