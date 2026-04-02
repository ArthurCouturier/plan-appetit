import { describe, it, expect, beforeEach, vi } from 'vitest';
import SandboxService from './SandboxService';

describe('SandboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random');
  });

  describe('getPlaceholders', () => {
    it('devrait charger les placeholders depuis le fichier importe', async () => {
      const result = await SandboxService.getPlaceholders();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.length > 0)).toBe(true);
    });

    it('devrait randomiser l\'ordre des placeholders', async () => {
      const result1 = await SandboxService.getPlaceholders();
      const result2 = await SandboxService.getPlaceholders();

      expect(result1).toHaveLength(result2.length);
      expect(result1.sort()).toEqual(result2.sort());
    });
  });

  describe('shuffleArray (via getPlaceholders)', () => {
    it('devrait preserver tous les elements lors du shuffle', async () => {
      const result = await SandboxService.getPlaceholders();
      const unique = new Set(result);

      expect(unique.size).toBe(result.length);
    });
  });
});
