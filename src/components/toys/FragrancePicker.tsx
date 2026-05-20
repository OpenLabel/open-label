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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TOY_FRAGRANCES,
  type SelectedFragrance,
  getFragranceById,
} from '@/data/toyFragrances';

interface FragrancePickerProps {
  selected: SelectedFragrance[];
  onChange: (selected: SelectedFragrance[]) => void;
}

export function FragrancePicker({ selected, onChange }: FragrancePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TOY_FRAGRANCES;
    return TOY_FRAGRANCES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.cas.toLowerCase().includes(q) ||
        f.id.includes(q),
    );
  }, [search]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selected.filter((s) => s.id !== id));
    } else {
      const f = getFragranceById(id);
      if (!f) return;
      onChange([
        ...selected,
        {
          id: f.id,
          name: f.name,
          cas: f.cas,
          concentration_mg_kg: '',
          component: '',
          above_threshold: true,
          supplier_declaration_uploaded: false,
          test_report_uploaded: false,
        },
      ]);
    }
  };

  const updateField = <K extends keyof SelectedFragrance>(
    id: string,
    field: K,
    value: SelectedFragrance[K],
  ) => {
    onChange(
      selected.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  const summary =
    selected.length === 0
      ? t('toys.fragrancePicker.empty', 'No allergenic fragrances added yet.')
      : t('toys.fragrancePicker.summary', '{{count}} fragrance(s) declared.', {
          count: selected.length,
        });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{summary}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('toys.fragrancePicker.addButton', 'Add fragrance')}
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="space-y-3">
          {selected.map((s) => (
            <div
              key={s.id}
              className="border rounded-md p-3 space-y-3 bg-muted/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('toys.fragrancePicker.cas', 'CAS')} {s.cas}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(s.id)}
                  aria-label={t('toys.fragrancePicker.removeAria', 'Remove {{name}}', { name: s.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`conc-${s.id}`} className="text-xs">
                    {t('toys.fragrancePicker.concentrationLabel', 'Concentration (mg/kg)')}
                  </Label>
                  <Input
                    id={`conc-${s.id}`}
                    type="number"
                    min={0}
                    value={s.concentration_mg_kg ?? ''}
                    onChange={(e) =>
                      updateField(
                        s.id,
                        'concentration_mg_kg',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`comp-${s.id}`} className="text-xs">
                    {t('toys.fragrancePicker.componentLabel', 'Component / material')}
                  </Label>
                  <Input
                    id={`comp-${s.id}`}
                    value={s.component ?? ''}
                    onChange={(e) =>
                      updateField(s.id, 'component', e.target.value)
                    }
                    placeholder={t('toys.fragrancePicker.componentPlaceholder', 'e.g., plush filling')}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={s.above_threshold ?? false}
                    onCheckedChange={(c) =>
                      updateField(s.id, 'above_threshold', Boolean(c))
                    }
                  />
                  {t('toys.fragrancePicker.aboveThreshold', 'Concentration ≥10 mg/kg')}
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={s.supplier_declaration_uploaded ?? false}
                    onCheckedChange={(c) =>
                      updateField(s.id, 'supplier_declaration_uploaded', Boolean(c))
                    }
                  />
                  {t('toys.fragrancePicker.supplierDeclaration', 'Supplier declaration on file')}
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={s.test_report_uploaded ?? false}
                    onCheckedChange={(c) =>
                      updateField(s.id, 'test_report_uploaded', Boolean(c))
                    }
                  />
                  {t('toys.fragrancePicker.testReport', 'Test report on file')}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {t('toys.fragrancePicker.dialogTitle', 'Select allergenic fragrances')}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('toys.fragrancePicker.searchPlaceholder', 'Search by name, CAS, or id...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={t('toys.fragrancePicker.clearSearch', 'Clear search')}
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
                  htmlFor={`frg-${f.id}`}
                  className="flex items-center justify-between gap-2 py-2 cursor-pointer hover:bg-muted/40 px-2 rounded"
                >
                  <div>
                    <p className="text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('toys.fragrancePicker.cas', 'CAS')} {f.cas}
                    </p>
                  </div>
                  <Checkbox
                    id={`frg-${f.id}`}
                    checked={selectedIds.includes(f.id)}
                    onCheckedChange={() => toggle(f.id)}
                  />
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {t('toys.fragrancePicker.noResults', 'No fragrances match "{{q}}".', { q: search })}
                </p>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setOpen(false)}>
              {t('toys.fragrancePicker.done', 'Done')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
