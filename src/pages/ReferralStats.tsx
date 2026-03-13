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

import { useParams } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";

interface Signup {
  label: string;
  signupDate: string;
  dppCount: number;
}

interface ReferralStatsData {
  signups: Signup[];
  total: number;
}

export default function ReferralStats() {
  const { code } = useParams<{ code: string }>();

  const { data, isLoading, error } = useQuery<ReferralStatsData>({
    queryKey: ["referral-stats", code],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "get-referral-stats",
        { body: { code } }
      );
      if (error) throw error;
      return data as ReferralStatsData;
    },
    enabled: !!code,
  });

  if (!code || !/^[a-zA-Z0-9]+$/.test(code)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Invalid referral code.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Referral Stats</span>
              <Badge variant="outline" className="text-sm font-mono">
                {code}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <p className="text-destructive">
                Failed to load referral stats. Please try again later.
              </p>
            ) : data && data.total > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground">
                    {data.total}
                  </span>{" "}
                  signup{data.total !== 1 ? "s" : ""} total
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Signup Date</TableHead>
                      <TableHead className="text-right">DPPs Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.signups.map((signup) => (
                      <TableRow key={signup.label}>
                        <TableCell className="font-medium">
                          {signup.label}
                        </TableCell>
                        <TableCell>
                          {new Date(signup.signupDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {signup.dppCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No signups yet for this referral code.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
