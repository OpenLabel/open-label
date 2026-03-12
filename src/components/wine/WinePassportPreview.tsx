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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WinePublicPassport } from './WinePublicPassport';

interface WinePassportPreviewProps {
  formData: {
    name: string;
    image_url: string | null;
    description: string;
    category_data: Record<string, unknown>;
  };
}

export function WinePassportPreview({ formData }: WinePassportPreviewProps) {
  const { t, i18n } = useTranslation();
  
  // Initialize preview language from current i18n language, but manage it separately
  const [previewLanguage, setPreviewLanguage] = useState(() => {
    return i18n.language.split('-')[0];
  });

  // Create a passport object from form data for the preview
  const previewPassport = {
    name: formData.name || 'Untitled Passport',
    image_url: formData.image_url,
    description: formData.description,
    category_data: formData.category_data,
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="sticky top-8">
      <div className="bg-background shadow-lg overflow-hidden max-w-[280px] mx-auto rounded-2xl border">
        {/* Phone frame styling */}
        <div className="bg-muted/50 p-2 flex justify-center">
          <div className="w-20 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        {/* Scaled preview container */}
        <div className="h-[500px] overflow-hidden">
          <div 
            className="overflow-y-auto origin-top"
            style={{
              transform: 'scale(0.65)',
              width: '154%', // 1 / 0.65 ≈ 154%
              height: '154%', // Scale the height to match
              transformOrigin: 'top left',
            }}
          >
            <WinePublicPassport 
              passport={previewPassport} 
              isPreview={true}
              previewLanguage={previewLanguage}
              onPreviewLanguageChange={setPreviewLanguage}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">{t('preview.livePreview')}</p>
    </div>
  );
}