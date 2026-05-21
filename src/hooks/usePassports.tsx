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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Passport, PassportFormData, ProductCategory } from '@/types/passport';

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
        .select()
        .single();
      
      if (error) throw error;
      return data as Passport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  const duplicatePassport = useMutation({
    mutationFn: async (passport: Passport) => {
      if (!user) throw new Error('User not authenticated');
      
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
      const { error } = await supabase
        .from('passports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  const reorderPassports = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each passport's display_order based on its position in the array
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('passports')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports', user?.id] });
    },
  });

  return {
    passports: passports || [],
    isLoading,
    error,
    createPassport,
    updatePassport,
    duplicatePassport,
    deletePassport,
    reorderPassports,
  };
}

export function usePassportBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['passport', 'public', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Use the edge function to fetch public passports (prevents scraping)
      const response = await supabase.functions.invoke('get-public-passport', {
        body: { slug },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch passport');
      }
      
      if (!response.data?.passport) {
        throw new Error('Passport not found');
      }
      
      return response.data.passport as Omit<Passport, 'user_id'>;
    },
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
