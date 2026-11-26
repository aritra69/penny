import { useEffect, useState } from "react";

import { API_URL, authHeaders } from "@/lib/auth/client";
import {
  reachedStart,
  summariseTrial,
  type TransactionSummaryInput,
  type TrialStats,
} from "@/lib/trial-stats";

const PAGE = 200; // the API's largest page
const MAX_PAGES = 10;

/**
 * What Penny did since `since` (the start of the free month), read from `GET /transactions`.
 * null while loading, without a start date, or when the API can't be reached: screens then leave
 * the figures out rather than show a guess.
 */
export function useTrialStats(since: string | null): TrialStats | null {
  const [stats, setStats] = useState<TrialStats | null>(null);

  useEffect(() => {
    if (!since) return;
    let cancelled = false;
    (async () => {
      const all: TransactionSummaryInput[] = [];
      const headers = await authHeaders();
      for (let page = 0; page < MAX_PAGES; page++) {
        const res = await fetch(`${API_URL}/transactions?limit=${PAGE}&offset=${page * PAGE}`, {
          headers,
        });
        if (!res.ok) throw new Error(`GET /transactions: ${res.status}`);
        const { data } = (await res.json()) as { data: TransactionSummaryInput[] };
        all.push(...data);
        if (data.length < PAGE || reachedStart(data, since)) break;
      }
      if (!cancelled) setStats(summariseTrial(all, since));
    })().catch(() => {
      if (!cancelled) setStats(null);
    });
    return () => {
      cancelled = true;
    };
  }, [since]);

  return since ? stats : null;
}
