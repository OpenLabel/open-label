// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.

import { Link } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Scale, ExternalLink, FileText, Shield } from 'lucide-react';

export default function LegalMentions() {
  const { config, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Scale className="h-8 w-8" />
              Legal Mentions
            </h1>
            <p className="text-muted-foreground">
              Information about the provider of this Digital Product Passport service.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Service Provider
            </h2>
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              {config?.company_name ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                    <p className="font-medium text-lg">{config.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Registered Address
                    </p>
                    <p className="whitespace-pre-wrap">{config.company_address}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground italic">
                  Provider information has not been configured for this instance.
                </p>
              )}
            </div>
          </section>

          {/* Legal Documents Section */}
          {(config?.privacy_policy_url || config?.terms_conditions_url) && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Legal Documents
              </h2>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                {config?.privacy_policy_url && (
                  <a 
                    href={config.privacy_policy_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {config?.terms_conditions_url && (
                  <a 
                    href={config.terms_conditions_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Terms & Conditions
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">About This Service</h2>
            <p className="text-muted-foreground">
              This is a Digital Product Passport (DPP) platform designed to help businesses 
              comply with EU regulations including the Ecodesign for Sustainable Products 
              Regulation (ESPR) and related directives.
            </p>
            <p className="text-muted-foreground">
              Digital Product Passports created on this platform contain product information 
              as provided by the product manufacturer or seller. The platform provider 
              facilitates the creation and hosting of these passports but is not responsible 
              for the accuracy of product data entered by users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Open Source Software</h2>
            <p className="text-muted-foreground">
              This platform is built on open source software. Organizations can self-host 
              their own instance for complete data control and sovereignty.
            </p>
          </section>

          <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {config?.company_name || 'Digital Product Passport Platform'}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
