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

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Terms() {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this Digital Product Passport platform operated by {config?.company_name || 'us'}, 
              you accept and agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Open Source License</h2>
            <p className="text-muted-foreground mb-2">
              This platform is open source software licensed under the{' '}
              <strong>Open-Label Public License (OLPL) v1.0</strong>. 
              This means you are free to use, modify, and distribute the software, provided that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-2">
              <li>Any modifications you make must also be licensed under the OLPL</li>
              <li>Interfaces displaying Digital Product Passports generated using this software must display "Powered by Open-Label.eu"</li>
              <li>You must include the original copyright notice and license</li>
            </ul>
            <p className="text-muted-foreground">
              If you are using a self-hosted instance of this platform on your own premises or infrastructure, 
              you acknowledge that you are solely responsible for the deployment, configuration, maintenance, 
              and operation of the software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Description of Service</h2>
            <p className="text-muted-foreground">
              This platform enables users to create, manage, and publish Digital Product Passports (DPPs). 
              DPPs provide consumers with information about products including ingredients, origin, and sustainability data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground font-semibold uppercase mb-2">
              THE SOFTWARE AND PLATFORM ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, 
              EXPRESS OR IMPLIED.
            </p>
            <p className="text-muted-foreground mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, 
              IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
              <li>FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT</li>
              <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. No Regulatory Compliance Warranty</h2>
            <p className="text-muted-foreground font-semibold uppercase mb-2">
              WE MAKE NO WARRANTY, REPRESENTATION, OR GUARANTEE THAT ANY DIGITAL PRODUCT PASSPORTS (DPPs) 
              CREATED USING THIS PLATFORM WILL BE COMPLIANT WITH ANY LAWS, REGULATIONS, DIRECTIVES, OR STANDARDS.
            </p>
            <p className="text-muted-foreground mb-2">
              This platform is provided as a <strong>free service</strong>. As such, we do not and cannot provide 
              any guarantees regarding regulatory compliance. Only you, the end user, can verify and guarantee 
              that your Digital Product Passports comply with applicable regulations, including but not limited to 
              the EU Digital Product Passport regulations, ESPR (Ecodesign for Sustainable Products Regulation), 
              EU Regulation 2021/2117 for wine products, or any other national or international regulatory requirements.
            </p>
            <p className="text-muted-foreground">
              You are solely responsible for reviewing, verifying, and ensuring that all information in your 
              product passports is accurate, complete, and meets all applicable legal and regulatory requirements 
              in your jurisdiction before publication and use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. User Accounts</h2>
            <p className="text-muted-foreground mb-2">When creating an account, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. User Responsibilities</h2>
            <p className="text-muted-foreground mb-2">You are solely responsible for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>The accuracy, legality, and regulatory compliance of all product information you submit</li>
              <li>Ensuring your product passports comply with all applicable laws and regulations</li>
              <li>Verifying that generated DPPs meet your jurisdiction's requirements</li>
              <li>Obtaining necessary rights for any content you upload</li>
              <li>Not using the service for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground font-semibold uppercase mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Regulatory fines, penalties, or sanctions</li>
              <li>Damages arising from non-compliant product passports</li>
              <li>Loss of data or business interruption</li>
              <li>Any other pecuniary loss</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              This limitation applies regardless of the theory of liability (contract, tort, strict liability, or otherwise) 
              and even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless the platform operators and contributors from any claims, 
              damages, losses, or expenses (including legal fees) arising from your use of the platform, your violation 
              of these terms, or your violation of any applicable laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Intellectual Property</h2>
            <p className="text-muted-foreground">
              You retain ownership of the content you create. By using this platform, you grant us a 
              license to display and distribute your product passports as necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Public Accessibility</h2>
            <p className="text-muted-foreground">
              Product passports created on this platform are designed to be publicly accessible via 
              unique URLs and QR codes. You acknowledge that any information in your product passports 
              will be viewable by anyone with the link.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the platform 
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for violations of these terms. 
              You may also delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms & Conditions, please contact:
            </p>
            {config?.company_address && (
              <p className="text-muted-foreground whitespace-pre-line mt-2">
                {config.company_name}<br />
                {config.company_address}
              </p>
            )}
          </section>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <Link to="/legal" className="hover:underline">Legal Mentions</Link>
          {' • '}
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
