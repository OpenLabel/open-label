// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useReferral } from "@/hooks/useReferral";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteConfigProvider, useSiteConfig } from "@/hooks/useSiteConfig";
import { BuildStatusBanner } from "@/components/BuildStatusBanner";
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
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

function ReferralCapture() {
  useReferral();
  return null;
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
        <Route path="/p/:slug" element={<PublicPassport />} />
        <Route path="/referral/:code" element={<ReferralStats />} />
        <Route path="/legal" element={<LegalMentions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
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
      <Route path="/legal" element={<LegalMentions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
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
            <ReferralCapture />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SiteConfigProvider>
  </QueryClientProvider>
);

export default App;
