import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteConfig {
  company_name: string;
  company_address: string;
  privacy_policy_url: string;
  terms_conditions_url: string;
  ai_enabled: boolean;
  sender_email: string;
  site_url: string;
  setup_complete: boolean;
}

interface SiteConfigContextType {
  config: SiteConfig | null;
  loading: boolean;
  isSetupRequired: boolean;
  refetch: () => Promise<void>;
  saveConfig: (config: Partial<SiteConfig>) => Promise<void>;
}

const defaultConfig: SiteConfig = {
  company_name: '',
  company_address: '',
  privacy_policy_url: '',
  terms_conditions_url: '',
  ai_enabled: true,
  sender_email: '',
  short_url: '',
  setup_complete: false,
};

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('key, value');

      if (error) throw error;

      if (!data || data.length === 0) {
        // No config exists yet - setup required
        setConfig(defaultConfig);
        setLoading(false);
        return;
      }

      // Convert array of key-value pairs to object
      const configObj: Record<string, string> = {};
      data.forEach((row: { key: string; value: string | null }) => {
        configObj[row.key] = row.value || '';
      });

      setConfig({
        company_name: configObj.company_name || '',
        company_address: configObj.company_address || '',
        privacy_policy_url: configObj.privacy_policy_url || '',
        terms_conditions_url: configObj.terms_conditions_url || '',
        ai_enabled: configObj.ai_enabled !== 'false', // Default to true
        sender_email: configObj.sender_email || '',
        short_url: configObj.short_url || '',
        setup_complete: configObj.setup_complete === 'true',
      });
    } catch (error) {
      console.error('Error fetching site config:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: Partial<SiteConfig>) => {
    const entries = Object.entries(newConfig).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    for (const entry of entries) {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          { key: entry.key, value: entry.value },
          { onConflict: 'key' }
        );

      if (error) throw error;
    }

    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const isSetupRequired = !loading && config !== null && !config.setup_complete;

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        loading,
        isSetupRequired,
        refetch: fetchConfig,
        saveConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
