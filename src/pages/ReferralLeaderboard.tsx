/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  code: string;
  validSignups: number;
  totalSignups: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

export default function ReferralLeaderboard() {
  const { data, isLoading, error } = useQuery<LeaderboardData>({
    queryKey: ["referral-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "get-referral-leaderboard"
      );
      if (error) throw error;
      return data as LeaderboardData;
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Referral Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : error ? (
              <p className="text-destructive">
                Failed to load leaderboard. Please try again later.
              </p>
            ) : data && data.leaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead className="text-right">Valid Signups</TableHead>
                    <TableHead className="text-right">Total Signups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard.map((entry) => (
                    <TableRow key={entry.code}>
                      <TableCell className="font-medium">
                        {entry.rank}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/referral/${entry.code}`}
                          className="font-mono text-primary underline-offset-4 hover:underline"
                        >
                          {entry.code}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {entry.validSignups}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {entry.totalSignups}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No referral data yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
