import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const CounterfeitRequestSchema = z.object({
  userEmail: z.string()
    .email("Invalid email address")
    .max(255, "Email too long"),
  passportName: z.string()
    .min(1, "Passport name is required")
    .max(500, "Passport name too long"),
  passportUrl: z.string()
    .url("Invalid URL format")
    .max(2000, "URL too long"),
  requestedAt: z.string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format"
    )
    .optional()
    .default(() => new Date().toISOString()),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parseResult = CounterfeitRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid input", 
          details: parseResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userEmail, passportName, passportUrl, requestedAt } = parseResult.data;

    // Get Resend API key from environment (Supabase secrets)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured. Please set it as a Supabase secret.");
    }

    // Get config data from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: configData } = await supabase
      .from("site_config")
      .select("key, value")
      .in("key", ["sender_email", "company_name"]);

    const config: Record<string, string> = {};
    configData?.forEach((row: { key: string; value: string | null }) => {
      config[row.key] = row.value || "";
    });

    const senderEmail = config.sender_email;
    const companyName = config.company_name || "Digital - Product - Passports .com";

    if (!senderEmail) {
      throw new Error("Sender email not configured. Please set it up in the Setup page.");
    }

    // Format the date and time
    const requestDate = new Date(requestedAt);
    const formattedDate = requestDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const formattedTime = requestDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    // Sanitize user inputs for HTML output to prevent XSS
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const safePassportName = escapeHtml(passportName);
    const safeUserEmail = escapeHtml(userEmail);
    const safePassportUrl = escapeHtml(passportUrl);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${companyName} <${senderEmail}>`,
        to: ["contact@cypheme.com"],
        cc: [userEmail],
        subject: `Counterfeit Protection Request - ${safePassportName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a; margin-bottom: 24px;">Counterfeit Protection Request</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              I have created a Digital Product Passport and would like to add counterfeit protection with a security seal.
            </p>
            
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Product Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px; width: 120px;">Product Name</td>
                  <td style="color: #1a1a1a; padding: 8px 0; font-size: 14px; font-weight: 500;">${safePassportName}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Passport URL</td>
                  <td style="padding: 8px 0; font-size: 14px;">
                    <a href="${safePassportUrl}" style="color: #2563eb; text-decoration: none;">${safePassportUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Contact Email</td>
                  <td style="color: #1a1a1a; padding: 8px 0; font-size: 14px;">${safeUserEmail}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Please contact me to discuss the security seal options and delivery.
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you,<br/>
              <span style="color: #666;">${safeUserEmail}</span>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
            
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              <strong>Why did I receive this email?</strong><br/>
              This email was sent because on ${formattedDate} at ${formattedTime}, the user clicked "Enable" on the counterfeit protection feature 
              in their Digital Product Passport editor.
            </p>
            
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              <strong>Was this a mistake?</strong><br/>
              If you did not intend to request counterfeit protection, simply reply to this email thread to let us know it was sent in error.
            </p>
          </div>
        `,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Counterfeit protection email sent:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending counterfeit protection email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
