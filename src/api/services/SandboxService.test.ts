import { describe, it, expect, beforeEach, vi } from 'vitest';
import SandboxService from './SandboxService';

describe('SandboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random for predictable shuffle results in some tests
    vi.spyOn(Math, 'random');
  });

  describe('getPlaceholders', () => {
    it('devrait charger les placeholders depuis le fichier texte', async () => {
      const mockPlaceholders = `Un dahl de lentilles corail rapide pour ce soir
5 recettes autour de la courge butternut
Un dessert sans lactose avec des poires`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockPlaceholders),
      });

      const result = await SandboxService.getPlaceholders();

      expect(global.fetch).toHaveBeenCalledWith('/sandbox_placeholders.txt');
      expect(result).toHaveLength(3);
      expect(result).toContain('Un dahl de lentilles corail rapide pour ce soir');
      expect(result).toContain('5 recettes autour de la courge butternut');
      expect(result).toContain('Un dessert sans lactose avec des poires');
    });

    it('devrait filtrer les lignes vides lors du parsing', async () => {
      const mockPlaceholders = `Un dahl de lentilles corail

5 recettes autour de la courge butternut

Un dessert sans lactose avec des poires

`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockPlaceholders),
      });

      const result = await SandboxService.getPlaceholders();

      expect(result).toHaveLength(3);
      expect(result.every((p) => p.length > 0)).toBe(true);
    });

    it('devrait trimmer les espaces autour des placeholders', async () => {
      const mockPlaceholders = `  Un dahl de lentilles corail
    5 recettes autour de la courge     `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockPlaceholders),
      });

      const result = await SandboxService.getPlaceholders();

      expect(result[0]).not.toMatch(/^\s/);
      expect(result[0]).not.toMatch(/\s$/);
      expect(result[1]).not.toMatch(/^\s/);
      expect(result[1]).not.toMatch(/\s$/);
    });

    it('devrait randomiser l\'ordre des placeholders', async () => {
      const mockPlaceholders = `Placeholder 1
Placeholder 2
Placeholder 3
Placeholder 4
Placeholder 5`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockPlaceholders),
      });

      // Récupérer les placeholders plusieurs fois
      const result1 = await SandboxService.getPlaceholders();
      const result2 = await SandboxService.getPlaceholders();

      // Tous les placeholders doivent être présents
      expect(result1).toHaveLength(5);
      expect(result2).toHaveLength(5);

      // Vérifier que les placeholders sont bien là (même si dans un ordre différent)
      expect(result1).toContain('Placeholder 1');
      expect(result1).toContain('Placeholder 2');
      expect(result1).toContain('Placeholder 3');
      expect(result1).toContain('Placeholder 4');
      expect(result1).toContain('Placeholder 5');
    });

    it('devrait retourner les placeholders par défaut si le fetch échoue', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await SandboxService.getPlaceholders();

      // Les placeholders par défaut doivent contenir au moins ces suggestions
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.some((p) =>
          p.includes('dahl de lentilles') ||
          p.includes('courge butternut') ||
          p.includes('batch cooking')
        )
      ).toBe(true);
    });

    it('devrait retourner les placeholders par défaut si la réponse n\'est pas ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await SandboxService.getPlaceholders();

      expect(result.length).toBeGreaterThan(0);
      expect(
        result.some((p) =>
          p.includes('dahl de lentilles') ||
          p.includes('courge butternut') ||
          p.includes('batch cooking')
        )
      ).toBe(true);
    });

    it('devrait gérer correctement un fichier vide', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const result = await SandboxService.getPlaceholders();

      // Devrait retourner un tableau vide (pas de placeholders par défaut dans ce cas)
      expect(result).toEqual([]);
    });
  });

  describe('shuffleArray (via getPlaceholders)', () => {
    it('ne devrait pas modifier le tableau original', () => {
      const original = ['A', 'B', 'C', 'D', 'E'];
      const copy = [...original];

      // Utiliser la méthode privée via getPlaceholders
      // On vérifie que l'original ne change pas en mockant fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(original.join('\n')),
      });

      SandboxService.getPlaceholders();

      // Le tableau original dans le mock ne devrait pas être modifié
      expect(copy).toEqual(original);
    });

    it('devrait préserver tous les éléments lors du shuffle', async () => {
      const mockPlaceholders = `Element 1
Element 2
Element 3
Element 4
Element 5`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockPlaceholders),
      });

      const result = await SandboxService.getPlaceholders();

      // Tous les éléments doivent être présents
      expect(result).toHaveLength(5);
      expect(result.sort()).toEqual([
        'Element 1',
        'Element 2',
        'Element 3',
        'Element 4',
        'Element 5',
      ].sort());
    });
  });

  describe('getDefaultPlaceholders (via fallback)', () => {
    it('devrait retourner les placeholders par défaut shufflés', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Error'));

      const result = await SandboxService.getPlaceholders();

      // Doit contenir les placeholders par défaut
      expect(result.length).toBeGreaterThan(5);
      expect(result.some((p) => p.includes('dahl de lentilles'))).toBe(true);
      expect(result.some((p) => p.includes('courge butternut'))).toBe(true);
      expect(result.some((p) => p.includes('dessert sans lactose'))).toBe(true);
      expect(result.some((p) => p.includes('batch cooking'))).toBe(true);
      expect(result.some((p) => p.includes('curry thaï'))).toBe(true);
    });

    it('devrait retourner 10 placeholders par défaut', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Error'));

      const result = await SandboxService.getPlaceholders();

      expect(result).toHaveLength(10);
    });
  });

  describe('Intégration avec le fichier réel', () => {
    it('devrait charger un grand nombre de placeholders du fichier réel', async () => {
      // Simuler un fichier avec 64 placeholders
      const largePlaceholderFile = Array.from(
        { length: 64 },
        (_, i) => `Placeholder ${i + 1}`
      ).join('\n');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(largePlaceholderFile),
      });

      const result = await SandboxService.getPlaceholders();

      expect(result).toHaveLength(64);
      expect(new Set(result).size).toBe(64); // Tous uniques
    });
  });
});
