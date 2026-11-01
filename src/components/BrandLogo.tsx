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
import logoHorizontal from '@/assets/brand/logo-primary.svg';
import logoIcon from '@/assets/brand/logo-icon.svg';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /** Tailwind height class for the logo, e.g. "h-8". */
  heightClass?: string;
  /** Breakpoint prefix where the full horizontal logo replaces the icon. */
  fullFrom?: 'sm' | 'md' | 'always';
  className?: string;
}

/** Official Open Label logo: icon on small screens, full logo on larger ones. */
export function BrandLogo({ heightClass = 'h-8', fullFrom = 'sm', className }: BrandLogoProps) {
  if (fullFrom === 'always') {
    return <img src={logoHorizontal} alt="Open Label" className={cn(heightClass, 'w-auto shrink-0', className)} />;
  }
  const showFull = fullFrom === 'md' ? 'hidden md:block' : 'hidden sm:block';
  const showIcon = fullFrom === 'md' ? 'md:hidden' : 'sm:hidden';
  return (
    <span className={cn('flex items-center shrink-0', className)}>
      <img src={logoIcon} alt="Open Label" className={cn(heightClass, 'w-auto', showIcon)} />
      <img src={logoHorizontal} alt="Open Label" className={cn(heightClass, 'w-auto', showFull)} />
    </span>
  );
}
