import { useSiteConfig } from '@/hooks/useSiteConfig';
import { carCleaningPassportUri } from '@/lib/carCleaningCarrier';
import { CarCleaningCarrier } from './CarCleaningCarrier';

interface SavedCarCleaningCarrierProps {
  slug: string;
  productName: string;
}

/** Both authoring entry points use the confirmed public origin and the saved identity. */
export function SavedCarCleaningCarrier({ slug, productName }: SavedCarCleaningCarrierProps) {
  const { config, loading, error } = useSiteConfig();
  const url = loading === false && error === false && config
    ? carCleaningPassportUri(config.site_url, window.location.origin, slug)
    : null;

  return <CarCleaningCarrier
    url={url ?? ''}
    productName={productName}
    machineReadableUrl={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-passport?slug=${slug}`}
  />;
}
