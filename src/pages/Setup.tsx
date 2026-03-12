import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, CheckCircle2, Server, Link2, FileText, Sparkles, Mail, Globe } from 'lucide-react';

export default function Setup() {
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('/privacy-policy');
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('/terms');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [senderEmail, setSenderEmail] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const { saveConfig } = useSiteConfig();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({ title: 'Error', description: 'Company name is required', variant: 'destructive' });
      return;
    }

    if (!companyAddress.trim()) {
      toast({ title: 'Error', description: 'Company address is required', variant: 'destructive' });
      return;
    }

    if (!senderEmail.trim()) {
      toast({ title: 'Error', description: 'Sender email is required', variant: 'destructive' });
      return;
    }

    if (!siteUrl.trim()) {
      toast({ title: 'Error', description: 'Website URL is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await saveConfig({
        company_name: companyName.trim(),
        company_address: companyAddress.trim(),
        privacy_policy_url: privacyPolicyUrl.trim(),
        terms_conditions_url: termsConditionsUrl.trim(),
        ai_enabled: aiEnabled,
        sender_email: senderEmail.trim(),
        site_url: siteUrl.trim(),
        setup_complete: true,
      });
      toast({ title: 'Setup complete!', description: 'Your instance is now configured.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <Server className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4">Final Step</Badge>
          <h1 className="text-3xl font-bold mb-2">Configure Your Instance</h1>
          <p className="text-muted-foreground">
            Enter your company details for EU legal compliance. This appears on all Digital Product Passports.
          </p>
        </div>

        <div className="space-y-6">
          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Provider Information
              </CardTitle>
              <CardDescription>
                Enter the details of the company or organization providing this DPP service. 
                This is required for EU compliance and will be displayed to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company / Organization Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Your Company SAS"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Registered Address *
                  </Label>
                  <Textarea
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="123 Business Street&#10;75001 Paris&#10;France"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Full legal address including street, city, postal code, and country.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyPolicyUrl" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Privacy Policy URL
                  </Label>
                  <Input
                    id="privacyPolicyUrl"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                    placeholder="/privacy-policy or https://example.com/privacy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsConditionsUrl" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Terms & Conditions URL
                  </Label>
                  <Input
                    id="termsConditionsUrl"
                    value={termsConditionsUrl}
                    onChange={(e) => setTermsConditionsUrl(e.target.value)}
                    placeholder="/terms or https://example.com/terms"
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    What this information is used for:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Displayed in "Legal Mentions" on all Digital Product Passports</li>
                    <li>• Required for EU e-label regulation compliance</li>
                    <li>• Identifies the service provider to consumers</li>
                    <li>• Privacy policy and terms links shown to users</li>
                  </ul>
                </div>

                {/* Sender Email Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Email Configuration</h3>
                    <Badge variant="default" className="text-xs">Required</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Sender Email Address *
                    </Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="noreply@your-verified-domain.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be from a domain you verified in Resend. Used for counterfeit protection requests.
                    </p>
                  </div>
                </div>

                {/* Website URL Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Website URL</h3>
                    <Badge variant="default" className="text-xs">Required</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Published Website URL *
                    </Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://open-label.eu"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The URL where this app is published. Used for QR codes and build status checks.
                    </p>
                  </div>
                </div>

                {/* AI Features Section (Optional) */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">AI Features</h3>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Enable wine label scanning and smart autofill. Only works if you set LOVABLE_API_KEY before deployment.
                  </p>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="aiEnabled"
                      checked={aiEnabled}
                      onCheckedChange={(checked) => setAiEnabled(checked === true)}
                    />
                    <Label htmlFor="aiEnabled" className="text-sm font-normal cursor-pointer flex-1">
                      Enable AI features
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={saving}>
                  {saving ? 'Saving...' : 'Complete Setup'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
