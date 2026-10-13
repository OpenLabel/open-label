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

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DETERGENT_ALLERGEN_PICKER_COPY as COPY,
  DETERGENT_FRAGRANCES,
  getDetergentFragranceById,
  type SelectedDetergentFragrance,
} from '@/data/detergentFragrances';

interface DetergentAllergenPickerProps {
  selected: SelectedDetergentFragrance[];
  onChange: (selected: SelectedDetergentFragrance[]) => void;
}

/**
 * Searchable picker over the 105 fragrance allergens of Regulation (EU) 2026/405,
 * Annex V Part D. Same interaction pattern as the Toys FragrancePicker.
 */
export function DetergentAllergenPicker({ selected, onChange }: DetergentAllergenPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DETERGENT_FRAGRANCES;
    return DETERGENT_FRAGRANCES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.chemical_name.toLowerCase().includes(q) ||
        f.cas.toLowerCase().includes(q) ||
        f.ec.toLowerCase().includes(q) ||
        f.id.includes(q) ||
        String(f.ref) === q,
    );
  }, [search]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selected.filter((s) => s.id !== id));
      return;
    }
    const f = getDetergentFragranceById(id);
    if (!f) return;
    onChange([...selected, { id: f.id, name: f.name, cas: f.cas }]);
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  const summary =
    selected.length === 0
      ? t('detergents.allergenPicker.empty', COPY.empty)
      : t('detergents.allergenPicker.summary', COPY.summary, {
          count: selected.length,
        });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{summary}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {t('detergents.allergenPicker.addButton', COPY.addButton)}
        </Button>
      </div>

      {selected.length > 0 && (
        <ul className="space-y-2">
          {selected.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-2 border rounded-md p-3 bg-muted/30"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm break-words">{s.name}</p>
                <p className="text-xs text-muted-foreground break-words">
                  {t('detergents.allergenPicker.cas', COPY.cas)} {s.cas}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(s.id)}
                aria-label={t('detergents.allergenPicker.removeAria', COPY.removeAria, {
                  name: s.name,
                })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {t('detergents.allergenPicker.dialogTitle', COPY.dialogTitle)}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('detergents.allergenPicker.searchPlaceholder', COPY.searchPlaceholder)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={t('detergents.allergenPicker.clearSearch', COPY.clearSearch)}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
            <div className="space-y-1 py-2">
              {filtered.map((f) => (
                <label
                  key={f.id}
                  htmlFor={`dal-${f.id}`}
                  className="flex items-center justify-between gap-2 py-2 cursor-pointer hover:bg-muted/40 px-2 rounded"
                >
                  <div className="min-w-0">
                    <p className="text-sm break-words">{f.name}</p>
                    <p className="text-xs text-muted-foreground break-words">
                      {t('detergents.allergenPicker.cas', COPY.cas)} {f.cas}
                    </p>
                  </div>
                  <Checkbox
                    id={`dal-${f.id}`}
                    checked={selectedIds.includes(f.id)}
                    onCheckedChange={() => toggle(f.id)}
                  />
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {t('detergents.allergenPicker.noResults', COPY.noResults, { q: search })}
                </p>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setOpen(false)}>
              {t('detergents.allergenPicker.done', COPY.done)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
