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

import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs">
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
