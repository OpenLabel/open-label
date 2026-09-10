import type { CategoryTemplate } from './base';
import { carCleaningSections } from '@/lib/carCleaning';
export { CAR_CLEANING_COPY } from '@/lib/carCleaning';

export const carCleaningTemplate: CategoryTemplate = {
  id: 'car_cleaning', name: 'Car cleaning products', icon: '🚗',
  description: 'Chemical product information and preparation for Regulation (EU) 2026/405.',
  sections: carCleaningSections,
  getRequiredLogos: () => [],
};
