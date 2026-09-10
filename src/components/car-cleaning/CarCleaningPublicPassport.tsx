import { carCleaningAutomaticImageUrl } from '@/lib/carCleaningImages';
import { CarCleaningHistory, type CarCleaningHistoryData } from './CarCleaningHistory';
import { CarCleaningDatasetView } from './CarCleaningDataset';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { Download, Printer } from 'lucide-react';
import { DPPLanguagePicker } from '@/components/DPPLanguagePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getTemplate, evaluateShowWhen, type TemplateQuestion } from '@/templates';
import { carCleaningFallback } from './copy';
import { exportCarCleaningPassport, publicCarCleaningData, publicHttpUrl, CAR_CLEANING_SOURCES } from '@/lib/carCleaning';
import { toDppLanguage } from '@/lib/dppLanguage';

interface CarCleaningPublicPassportProps {
  passport: {
    name: string;
    dpp_history?: CarCleaningHistoryData;
    image_url?: string | null;
    description?: string | null;
    category_data: Record<string, unknown>;
    updated_at?: string;
    public_slug?: string | null;
  };
  isPreview?: boolean;
  previewLanguage?: string;
  onPreviewLanguageChange?: (language: string) => void;
}

export function CarCleaningPublicPassport({ passport, isPreview = false, previewLanguage, onPreviewLanguageChange }: CarCleaningPublicPassportProps) {
  const { i18n } = useTranslation();
  const language = previewLanguage || toDppLanguage(i18n.language);
  const t = i18n.getFixedT(language);
  const copy = (key: string) => t(key, carCleaningFallback(key));
  const data = publicCarCleaningData(passport.category_data);
  const template = getTemplate('car_cleaning');
  const translatedValue = (id: string): unknown => {
    const translations = data[`${id}_translations`];
    if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
      const translated = (translations as Record<string, unknown>)[language];
      if (typeof translated === 'string' && translated.trim()) return translated;
    }
    return data[id];
  };
  const productName = translatedValue('product_name');
  const sourceImageUrl = publicHttpUrl(passport.image_url);
  const imageUrl = carCleaningAutomaticImageUrl(passport.image_url, import.meta.env.VITE_SUPABASE_URL, window.location.origin);
  const description = translatedValue('description') || passport.description;

  function displayValue(question: TemplateQuestion): string {
    const value = translatedValue(question.id);
    const optionLabel = (candidate: unknown): string => {
      const option = question.options?.find(item => item.value === candidate);
      return option ? option.labelKey ? t(option.labelKey, option.label) : option.label : '';
    };
    if (question.type === 'substances' || question.type === 'microorganisms') return Array.isArray(value) && value.length > 0 ? String(value.length) : '';
    if (question.type === 'select') return optionLabel(value);
    if (question.type === 'multi_select') return Array.isArray(value) ? value.map(optionLabel).filter(Boolean).join(', ') : '';
    if (typeof value === 'boolean') return t(value ? 'common.yes' : 'common.no');
    return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)) ? String(value) : '';
  }

  const sections = template.sections.filter(section => evaluateShowWhen(section.showWhen, data)).map(section => ({
    ...section,
    questions: section.questions.filter(question => !question.internal && question.id !== 'product_name' && evaluateShowWhen(question.showWhen, data) && displayValue(question).trim()),
  })).filter(section => section.questions.length > 0);

  function downloadJson() {
    const exported = exportCarCleaningPassport({ ...passport, category: 'car_cleaning' });
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${typeof productName === 'string' ? productName.replace(/[^a-z0-9]/gi, '_').slice(0, 80) || 'car_cleaning' : 'car_cleaning'}_passport.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div lang={language} className="min-h-screen bg-background text-foreground print:bg-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-end print:hidden">
          <DPPLanguagePicker localOnly={isPreview} currentLanguage={previewLanguage} onLanguageChange={onPreviewLanguageChange} />
        </div>
        <header className="flex flex-col sm:flex-row gap-5 items-start">
          {imageUrl && <img referrerPolicy="no-referrer" src={imageUrl} alt={typeof productName === 'string' ? productName : ''} className="w-32 h-32 object-contain rounded-lg border" />}
          <div className="min-w-0 space-y-3">
            <Badge variant="secondary">{copy('carCleaning.publicTitle')}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold break-words">{typeof productName === 'string' && productName.trim() ? productName : copy('carCleaning.publicTitle')}</h1>
          </div>
          {!imageUrl && sourceImageUrl && <a href={sourceImageUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">{copy('carCleaning.fields.label_image_url')}</a>}
        </header>
        <aside className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-950">
          <h2 className="font-semibold mb-2">{copy('carCleaning.noticeTitle')}</h2>
          <p className="whitespace-pre-line">{copy('carCleaning.noticeBody')}</p>
          <p className="mt-3">{copy('carCleaning.limits')}</p>
        </aside>
        {typeof description === 'string' && description.trim() && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description, { FORBID_TAGS: ['img', 'video', 'audio', 'source', 'iframe', 'object', 'embed', 'svg'], FORBID_ATTR: ['style'] }) }} />}
        {sections.map((section, index) => (
          <Card key={section.id || index} className="print:shadow-none break-inside-avoid">
            <CardHeader className="pb-3"><h2 className="text-lg font-semibold">{section.titleKey ? t(section.titleKey, section.title) : section.title}</h2></CardHeader>
            <CardContent><dl className="space-y-3">
              {section.questions.map(question => {
                const value = displayValue(question);
                const url = question.id.endsWith('_url') ? publicHttpUrl(data[question.id]) : null;
                return (
                  <div key={question.id} className="grid gap-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{question.labelKey ? t(question.labelKey, question.label) : question.label}</dt>
                    <dd className="text-sm whitespace-pre-wrap break-words min-w-0">{question.type === 'substances' || question.type === 'microorganisms' ? <CarCleaningDatasetView kind={question.type} value={data[question.id]} translate={t} /> : url ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-primary break-all">{value}</a> : value}</dd>
                  </div>
                );
              })}
            </dl></CardContent>
          </Card>
        ))}
        {sections.length === 0 && <p className="text-sm text-muted-foreground">{copy('carCleaning.emptyPublic')}</p>}
        {!isPreview && <CarCleaningHistory slug={passport.public_slug} history={passport.dpp_history} />}
        {!isPreview && <div className="flex flex-wrap gap-3 print:hidden">
          <Button variant="outline" onClick={downloadJson}><Download className="mr-2 h-4 w-4" />{copy('carCleaning.downloadJson')}</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />{copy('carCleaning.print')}</Button>
        </div>}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">{copy('carCleaning.sources')}</summary>
          <ul className="mt-3 space-y-2">
            {CAR_CLEANING_SOURCES.map(source => {
              const identifier = source.title.match(/\((EU|EC)\).*?(\d+\/\d+)/);
              return <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">{identifier ? `${identifier[1]} ${identifier[2]}` : source.url}</a></li>;
            })}
          </ul>
        </details>
        <footer className="border-t pt-5 text-center text-sm text-muted-foreground space-y-3">
          <p>{t('passport.poweredBy')}{' '}<a href="https://www.open-label.eu" target="_blank" rel="noopener noreferrer" className="text-primary underline">Open-Label.eu</a></p>
          <Link to="/legal" className="inline-block underline print:hidden">{t('legal.legalMentions')}</Link>
        </footer>
      </main>
    </div>
  );
}
