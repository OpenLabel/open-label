/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Copy, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface Signup {
  email: string | null;
  userId: string;
  signedUpAt: string | null;
  referredAt: string;
  hasPassport: boolean;
}

interface Entry {
  rank: number;
  code: string;
  validSignups: number;
  totalSignups: number;
  signups: Signup[];
}

interface Data {
  generatedAt: string;
  totals: { codes: number; totalSignups: number; validSignups: number };
  leaderboard: Entry[];
}

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/get-admin-leaderboard`;

export default function AdminLeaderboard() {
  // Noindex this page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Admin Leaderboard";
    return () => {
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? decodeURIComponent(window.location.hash.replace(/^#/, ""))
        : "",
    [],
  );

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${FUNCTIONS_URL}?token=${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.error || `HTTP ${r.status}`);
        return body as Data;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Forbidden</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This page is not publicly accessible.
          </CardContent>
        </Card>
      </div>
    );
  }

  const apiUrl = `${FUNCTIONS_URL}?token=${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Admin Referral Leaderboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(apiUrl);
                toast.success("API URL copied");
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON API URL
            </Button>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive">Error: {error}</div>
            )}
            {data && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <Stat label="Codes" value={data.totals.codes} />
                  <Stat label="Total signups" value={data.totals.totalSignups} />
                  <Stat label="Valid signups" value={data.totals.validSignups} />
                </div>
                {data.leaderboard.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No referrals yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.leaderboard.map((entry) => {
                      const open = !!expanded[entry.code];
                      return (
                        <div
                          key={entry.code}
                          className="border rounded-lg overflow-hidden"
                        >
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                            onClick={() =>
                              setExpanded((p) => ({
                                ...p,
                                [entry.code]: !p[entry.code],
                              }))
                            }
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Badge variant="outline" className="shrink-0">
                                #{entry.rank}
                              </Badge>
                              <span className="font-mono font-semibold truncate">
                                {entry.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm shrink-0">
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                {entry.validSignups} valid
                              </Badge>
                              <Badge variant="outline">
                                {entry.totalSignups} total
                              </Badge>
                            </div>
                          </button>
                          {open && (
                            <div className="border-t bg-muted/20">
                              {entry.signups.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground">
                                  No signups.
                                </div>
                              ) : (
                                <ul className="divide-y">
                                  {entry.signups.map((s) => (
                                    <li
                                      key={s.userId}
                                      className="flex items-center justify-between gap-2 px-4 py-2 text-sm"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        {s.hasPassport ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                        ) : (
                                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                        <span className="truncate">
                                          {s.email ?? (
                                            <span className="text-muted-foreground italic">
                                              (no email)
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {s.referredAt
                                          ? new Date(s.referredAt).toLocaleDateString()
                                          : ""}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-6 text-xs text-muted-foreground">
                  Generated at {new Date(data.generatedAt).toLocaleString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
