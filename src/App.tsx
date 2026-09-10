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

// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { initGoogleAdsTag, isPublicPassportPath, trackPageView } from "@/lib/googleAdsTracking";
import { useReferral } from "@/hooks/useReferral";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteConfigProvider, useSiteConfig } from "@/hooks/useSiteConfig";
import { BuildStatusBanner } from "@/components/BuildStatusBanner";
import { ConsentBanner } from "@/components/ConsentBanner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PassportForm from "./pages/PassportForm";
import PublicPassport from "./pages/PublicPassport";
import LegalMentions from "./pages/LegalMentions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Setup from "./pages/Setup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ReferralStats from "./pages/ReferralStats";
import ReferralLeaderboard from "./pages/ReferralLeaderboard";
import AdminLeaderboard from "./pages/AdminLeaderboard";
import Admin from "./pages/Admin";
import CyphemePassport from "./pages/CyphemePassport";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

function ReferralCapture() {
  useReferral();
  return null;
}

function GoogleAdsTracker() {
  const location = useLocation();
  useEffect(() => {
    initGoogleAdsTag();
  }, []);
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

function MarketingTools() {
  const { pathname } = useLocation();
  if (isPublicPassportPath(pathname)) return null;
  return (
    <>
      <ReferralCapture />
      <GoogleAdsTracker />
      <ConsentBanner />
    </>
  );
}

function AppRoutes() {
  const { loading, isSetupRequired } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  // If setup is not complete and we're not on the setup page, redirect to setup
  // Exception: public passport pages should still work
  if (isSetupRequired) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        {/* BUG-01: auth flows must remain reachable during setup so admins can sign in / recover */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/p/:slug" element={<PublicPassport />} />
        <Route path="/referral/:code" element={<ReferralStats />} />
        <Route path="/referral-leaderboard" element={<ReferralLeaderboard />} />
        <Route path="/admin-leaderboard" element={<AdminLeaderboard />} />
        <Route path="/legal" element={<LegalMentions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cypheme/passport" element={<CyphemePassport />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/passport/new" element={<PassportForm />} />
      <Route path="/passport/:id/edit" element={<PassportForm />} />
      <Route path="/p/:slug" element={<PublicPassport />} />
      <Route path="/referral/:code" element={<ReferralStats />} />
      <Route path="/referral-leaderboard" element={<ReferralLeaderboard />} />
      <Route path="/admin-leaderboard" element={<AdminLeaderboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/legal" element={<LegalMentions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cypheme/passport" element={<CyphemePassport />} />
      <Route path="/setup" element={<Navigate to="/" replace />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteConfigProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BuildStatusBanner />
            <MarketingTools />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SiteConfigProvider>
  </QueryClientProvider>
);

export default App;
