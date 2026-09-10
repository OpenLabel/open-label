import { describe, expect, it } from 'vitest';
import { carCleaningAutomaticImageUrl } from './carCleaningImages';
describe('Public car passport image privacy', () => {
  it('does not automatically contact arbitrary supplier or tracking hosts', () => {
    expect(carCleaningAutomaticImageUrl('https://tracker.example.test/pixel', 'https://project.example.test', 'https://open-label.eu')).toBeNull();
    expect(carCleaningAutomaticImageUrl('https://project.example.test.evil.test/storage/v1/object/public/passport-images/label.png', 'https://project.example.test', 'https://open-label.eu')).toBeNull();
  });
  it('allows the configured public image bucket and application origin only', () => {
    const managed = 'https://project.example.test/storage/v1/object/public/passport-images/owner/label.png';
    expect(carCleaningAutomaticImageUrl(managed, 'https://project.example.test', 'https://open-label.eu')).toBe(managed);
    expect(carCleaningAutomaticImageUrl('https://open-label.eu/label.png', '', 'https://open-label.eu')).toBe('https://open-label.eu/label.png');
    expect(carCleaningAutomaticImageUrl('javascript:alert(1)', '', 'https://open-label.eu')).toBeNull();
  });
});
