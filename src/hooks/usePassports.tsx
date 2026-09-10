import { prepareCarCleaningDuplicate, writeCarCleaningPassport } from '@/lib/carCleaningWrite';
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { fetchPublicPassport } from '@/lib/publicPassportFetch';
import type { Passport, PassportFormData, ProductCategory } from '@/types/passport';

// Stable empty-array reference so consumers that sync via useEffect don't
// re-fire on every render when the query has no data (would infinite-loop).
const EMPTY_PASSPORTS: Passport[] = [];

export function usePassports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: passports, isLoading, error } = useQuery({
    queryKey: ['passports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('passports')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Passport[];
    },
    enabled: !!user,
  });

  const createPassport = useMutation({
    mutationFn: async (formData: PassportFormData) => {
      if (!user) throw new Error('User not authenticated');
      if (formData.category === 'car_cleaning') return writeCarCleaningPassport(formData, (name, options) => supabase.functions.invoke(name, options));
      
      const { data, error } = await supabase
        .from('passports')
        .insert([{
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description,
          language: formData.language,
          category_data: formData.category_data,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Passport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  const updatePassport = useMutation({
    mutationFn: async ({ id, ...formData }: PassportFormData & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      if (formData.category === 'car_cleaning') return writeCarCleaningPassport({ ...formData, id }, (name, options) => supabase.functions.invoke(name, options));
      const { data, error } = await supabase
        .from('passports')
        .update({
          name: formData.name,
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description,
          language: formData.language,
          category_data: formData.category_data,
        })
        .eq('id', id)
        .eq('user_id', user.id) // BUG-38: defense-in-depth scoping
        .select()
        .single();
      
      if (error) throw error;
      return data as Passport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
      // NEW-03: invalidate the per-passport cache so a subsequent form load
      // (e.g. right after a counterfeit send-and-persist flow) doesn't read
      // a stale row missing counterfeit_request_sent_at.
      if (data?.id) queryClient.invalidateQueries({ queryKey: ['passport', data.id] });
    },
  });

  const duplicatePassport = useMutation({
    mutationFn: async (passport: Passport) => {
      if (!user) throw new Error('User not authenticated');
      if (passport.category === 'car_cleaning') return writeCarCleaningPassport({ name: `${passport.name} (Copy)`, category: 'car_cleaning', image_url: passport.image_url, description: passport.description || '', language: passport.language, category_data: prepareCarCleaningDuplicate(passport.category_data, passport.public_slug ? `${window.location.origin}/p/${passport.public_slug}` : undefined) as PassportFormData['category_data'] }, (name, options) => supabase.functions.invoke(name, options));
      
      const { data, error } = await supabase
        .from('passports')
        .insert([{
          user_id: user.id,
          name: `${passport.name} (Copy)`,
          category: passport.category,
          image_url: passport.image_url,
          description: passport.description,
          language: passport.language,
          category_data: passport.category_data,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Passport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  const deletePassport = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('passports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // BUG-38: defense-in-depth scoping
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['car-cleaning-retained', user?.id] });
    },
  });

  const reorderPassports = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!user) throw new Error('User not authenticated');
      // BUG-15: single-transaction reorder via SECURITY DEFINER RPC scoped to
      // auth.uid(). Prevents partial updates when the network flakes mid-batch.
      const { error } = await supabase.rpc('reorder_passports', { p_ids: orderedIds });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
    onError: (err: unknown) => {
      // BUG-15: surface reorder failures to the user; also refetch so the
      // UI reverts to server truth if the optimistic order is wrong.
      const message = err instanceof Error ? err.message : 'Failed to reorder passports';
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  return {
    passports: passports ?? EMPTY_PASSPORTS,
    isLoading,
    error,
    createPassport,
    updatePassport,
    duplicatePassport,
    deletePassport,
    reorderPassports,
  };
}

export function usePassportBySlug(slug: string | undefined, selection?: { version?: string; history_before?: string }) {
  return useQuery({
    queryKey: ['passport', 'public', slug, selection?.version, selection?.history_before],
    queryFn: ({ signal }) => slug ? fetchPublicPassport(slug, signal, undefined, undefined, selection) : null,
    enabled: !!slug,
  });
}

export function usePassportById(id: string | undefined) {
  return useQuery({
    queryKey: ['passport', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('passports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Passport;
    },
    enabled: !!id,
  });
}

// Identity field keys prefilled from the user's last passport when creating a new one.
// Product-specific fields are intentionally excluded.
export const PREFILL_IDENTITY_KEYS = [
  'brand_name',
  'manufacturer_legal_name',
  'manufacturer_street',
  'manufacturer_postal_code',
  'manufacturer_city',
  'manufacturer_country',
  'manufacturer_email',
  'manufacturer_website',
  'manufacturer_operator_id',
  'manufacturer_operator_id_type',
  'manufacturer_non_eu',
  'has_auth_rep',
  'auth_rep_legal_name',
  'auth_rep_street',
  'auth_rep_postal_code',
  'auth_rep_city',
  'auth_rep_country',
  'auth_rep_email',
  'auth_rep_operator_id',
  'auth_rep_operator_id_type',
  'eu_op_legal_name',
  'eu_op_role',
  'eu_op_street',
  'eu_op_postal_code',
  'eu_op_city',
  'eu_op_country',
  'eu_op_email',
  'eu_op_operator_id',
  'eu_op_operator_id_type',
] as const;

export function useLatestPassportDefaults(category: ProductCategory | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['passport', 'latest-defaults', user?.id, category],
    queryFn: async () => {
      if (!user || !category) return null;

      const sameCategory = await supabase
        .from('passports')
        .select('category_data')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let source = sameCategory.data?.category_data as Record<string, unknown> | undefined;

      if (!source) {
        const anyCategory = await supabase
          .from('passports')
          .select('category_data')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        source = anyCategory.data?.category_data as Record<string, unknown> | undefined;
      }

      if (!source) return null;

      const defaults: Record<string, unknown> = {};
      for (const key of PREFILL_IDENTITY_KEYS) {
        const val = source[key];
        if (val !== undefined && val !== null && val !== '') {
          defaults[key] = val;
        }
      }
      return defaults;
    },
    enabled: !!user && !!category,
    staleTime: 5 * 60 * 1000,
  });
}
