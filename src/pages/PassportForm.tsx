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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { usePassports, usePassportById } from '@/hooks/usePassports';
import { categoryList } from '@/templates';
import type { ProductCategory } from '@/types/passport';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImageUpload } from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { CategoryQuestions } from '@/components/CategoryQuestions';
import { WineFields } from '@/components/WineFields';
import { WineAIAutofill } from '@/components/wine/WineAIAutofill';
import { PassportPreview } from '@/components/PassportPreview';
import { CounterfeitProtection } from '@/components/CounterfeitProtection';
import { TranslationButton, type Translations } from '@/components/TranslationButton';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FormData {
  name: string;
  category: ProductCategory;
  image_url: string | null;
  description: string;
  language: string;
  category_data: Record<string, unknown>;
}

export default function PassportForm() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.split('-')[0];
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createPassport, updatePassport } = usePassports();
  const { data: existingPassport, isLoading: passportLoading } = usePassportById(isEditing ? id : undefined);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'wine',
    image_url: null,
    description: '',
    language: 'en',
    category_data: {},
  });
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const savedFormDataRef = useRef<string>('');

  // Helper to update category_data
  const handleCategoryDataChange = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      category_data: { ...prev.category_data, [key]: value },
    }));
  }, []);

  // Auto-translate product name (for non-wine categories)
  const isNonWine = formData.category !== 'wine';
  const productNameValue = (formData.category_data.product_name as string) || '';
  const productNameTranslations = (formData.category_data.product_name_translations as Translations) || {};

  const handleProductNameTranslations = useCallback((translations: Translations) => {
    setFormData(prev => ({
      ...prev,
      category_data: { ...prev.category_data, product_name_translations: translations },
    }));
  }, []);

  const { isTranslating: isProductNameTranslating, markAsUserEdited: markProductNameEdited } = useAutoTranslate({
    value: productNameValue,
    sourceLanguage: currentLanguage,
    existingTranslations: productNameTranslations,
    onTranslationsGenerated: handleProductNameTranslations,
    enabled: isNonWine && !!productNameValue.trim(),
  });

  // Auto-translate description (for non-wine categories)
  const descriptionTranslations = (formData.category_data.description_translations as Translations) || {};

  const handleDescriptionTranslations = useCallback((translations: Translations) => {
    setFormData(prev => ({
      ...prev,
      category_data: { ...prev.category_data, description_translations: translations },
    }));
  }, []);

  const { isTranslating: isDescriptionTranslating, markAsUserEdited: markDescriptionEdited } = useAutoTranslate({
    value: formData.description,
    sourceLanguage: currentLanguage,
    existingTranslations: descriptionTranslations,
    onTranslationsGenerated: handleDescriptionTranslations,
    enabled: isNonWine && !!formData.description.trim(),
    debounceMs: 3000,
  });

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const currentData = JSON.stringify(formData);
    return currentData !== savedFormDataRef.current;
  }, [formData]);

  // Handle back navigation with unsaved changes check
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/dashboard');
    }
  }, [hasUnsavedChanges, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (existingPassport) {
      const newFormData = {
        name: existingPassport.name,
        category: existingPassport.category,
        image_url: existingPassport.image_url,
        description: existingPassport.description || '',
        language: existingPassport.language,
        category_data: (existingPassport.category_data as Record<string, unknown>) || {},
      };
      setFormData(newFormData);
      // Store initial saved state
      savedFormDataRef.current = JSON.stringify(newFormData);
    }
  }, [existingPassport]);

  // For new passports, set initial saved state once
  useEffect(() => {
    if (!isEditing && savedFormDataRef.current === '') {
      savedFormDataRef.current = JSON.stringify(formData);
    }
  }, [isEditing, formData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: t('common.error'), description: t('passport.enterProductName'), variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        category_data: formData.category_data as Json,
      };
      if (isEditing) {
        await updatePassport.mutateAsync({ id, ...submitData });
        toast({ title: t('common.success'), description: t('passport.updated') });
        // Update saved state after successful save
        savedFormDataRef.current = JSON.stringify(formData);
      } else {
        const newPassport = await createPassport.mutateAsync(submitData);
        toast({ title: t('common.success'), description: t('passport.created') });
        // Update saved state after successful save
        savedFormDataRef.current = JSON.stringify(formData);
        // Navigate to edit mode for the newly created passport
        navigate(`/passport/${newPassport.id}/edit`, { replace: true });
      }
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: ⌘+S (Mac) or Ctrl+S (Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, saving]);

  if (authLoading || (isEditing && passportLoading)) {
    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show preview for all categories
  const showPreview = true;

  return (
    <>
      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('passport.unsavedChanges')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('passport.unsavedChangesDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/dashboard')}>
              {t('passport.leaveWithoutSaving')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {isEditing ? t('passport.editTitle') : t('passport.createTitle')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <LanguageSwitcher />
              <Button type="submit" form="passport-form" disabled={saving} size="sm" className="gap-1 sm:gap-2 sm:size-default">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">{t('passport.saving')}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">{isEditing ? t('passport.saveChanges') : t('common.create')}</span>
                    <span className="hidden md:inline ml-1 text-xs opacity-60">⌘S</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`flex gap-8 ${showPreview ? 'lg:flex-row flex-col' : ''}`}>
          {/* Form Section */}
          <div className={showPreview ? 'flex-1 min-w-0' : 'max-w-3xl mx-auto w-full'}>
            <form id="passport-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('passport.basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('passport.dppName')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('passport.dppNamePlaceholder')}
                    />
                    <p className="text-xs text-muted-foreground">{t('passport.dppNameHelp')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t('passport.category')} *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: ProductCategory) => 
                        setFormData({ ...formData, category: value, category_data: {} })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{t(`categories.${cat.value}`)}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* AI Autofill Button - between Basic Info and Product Image (wine only) */}
              {formData.category === 'wine' && (
                <WineAIAutofill
                  onAutofill={(extractedData) => {
                    // Delegate to WineFields' handler by updating category_data
                    // We need to trigger WineFields' handleAIAutofill indirectly
                    setFormData(prev => ({
                      ...prev,
                      category_data: { ...prev.category_data, __ai_autofill: extractedData },
                    }));
                  }}
                  onAutofillMeta={async (meta) => {
                    const updates: Partial<FormData> = {};
                    if (meta.dppName && !formData.name.trim()) {
                      updates.name = meta.dppName;
                    }
                    if (meta.productImageBase64 && user) {
                      try {
                        const res = await fetch(meta.productImageBase64);
                        const blob = await res.blob();
                        const ext = blob.type.split('/')[1] || 'jpg';
                        const fileName = `${Date.now()}-ai-product.${ext}`;
                        const filePath = `${user.id}/${fileName}`;
                        const { error: uploadError } = await supabase.storage
                          .from('passport-images')
                          .upload(filePath, blob);
                        if (!uploadError) {
                          const { data: urlData } = supabase.storage
                            .from('passport-images')
                            .getPublicUrl(filePath);
                          updates.image_url = urlData.publicUrl;
                        }
                      } catch (e) {
                        console.error('Failed to upload AI product image:', e);
                      }
                    }
                    if (Object.keys(updates).length > 0) {
                      setFormData(prev => ({ ...prev, ...updates }));
                    }
                  }}
                />
              )}

              {/* Product Image - right after basic information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('passport.productImage')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </CardContent>
              </Card>

              {/* Wine-specific fields */}
              {formData.category === 'wine' && (
                <WineFields
                  data={(formData.category_data as Record<string, unknown>) || {}}
                  onChange={(data) => setFormData({ ...formData, category_data: data })}
                />
              )}

              {/* Product Name & Description for non-wine categories */}
              {formData.category !== 'wine' && (
                <>
                  {/* Product Name with translations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('passport.productName')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="product_name">{t('passport.productName')}</Label>
                        {isProductNameTranslating && <span className="text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating')}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="product_name"
                          value={productNameValue}
                          onChange={(e) => handleCategoryDataChange('product_name', e.target.value)}
                          placeholder={t('passport.productNamePlaceholder')}
                          className="flex-1"
                        />
                        <TranslationButton
                          value={productNameValue}
                          sourceLanguage={currentLanguage}
                          translations={productNameTranslations}
                          onSave={(translations) => {
                            Object.keys(translations).forEach(lang => markProductNameEdited(lang));
                            handleCategoryDataChange('product_name_translations', translations);
                          }}
                          fieldLabel={t('passport.productName')}
                          disabled={!productNameValue}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{t('passport.productNameHelp')}</p>
                    </CardContent>
                  </Card>

                  {/* Product Description with translations */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-1.5">
                        <CardTitle>{t('passport.productDescription')}</CardTitle>
                        {isDescriptionTranslating && <span className="text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating')}</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <RichTextEditor
                        content={formData.description}
                        onChange={(content) => setFormData({ ...formData, description: content })}
                        placeholder={t('passport.descriptionPlaceholder')}
                      />
                      <div className="flex justify-end">
                        <TranslationButton
                          value={formData.description.replace(/<[^>]*>/g, '')}
                          sourceLanguage={currentLanguage}
                          translations={descriptionTranslations}
                          onSave={(translations) => {
                            Object.keys(translations).forEach(lang => markDescriptionEdited(lang));
                            handleCategoryDataChange('description_translations', translations);
                          }}
                          fieldLabel={t('passport.productDescription')}
                          disabled={!formData.description.trim()}
                          size="sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Category-Specific Questions (skip for wine - has its own WineFields) */}
              {formData.category !== 'wine' && (
                <div>
                  <CategoryQuestions
                    category={formData.category}
                    data={(formData.category_data as Record<string, unknown>) || {}}
                    onChange={(data) => setFormData({ ...formData, category_data: data })}
                  />
                </div>
              )}

              {/* Counterfeit Protection - always last */}
              <CounterfeitProtection
                passportName={formData.name}
                passportSlug={existingPassport?.public_slug ?? null}
                userEmail={user?.email}
                enabled={formData.category_data.counterfeit_protection_enabled === true}
                onChange={(enabled) => setFormData({
                  ...formData,
                  category_data: {
                    ...formData.category_data,
                    counterfeit_protection_enabled: enabled,
                  },
                })}
              />

              {/* Actions - Mobile only */}
              <div className="flex gap-4 justify-end lg:hidden">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('passport.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing ? t('passport.saveChanges') : t('common.create')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section - All categories */}
          {showPreview && (
            <aside className="lg:w-80 w-full lg:sticky lg:top-24 lg:self-start">
              <PassportPreview formData={formData} />
            </aside>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
