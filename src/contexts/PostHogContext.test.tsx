import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHogProvider, usePostHog } from './PostHogContext';
import posthog from 'posthog-js';

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

// Composant de test pour utiliser le hook
function TestComponent() {
  const { trackEvent, identify, reset } = usePostHog();

  return (
    <div>
      <button onClick={() => trackEvent('test_event', { prop: 'value' })}>
        Track Event
      </button>
      <button onClick={() => identify('user-123', { email: 'test@test.com' })}>
        Identify
      </button>
      <button onClick={() => reset()}>
        Reset
      </button>
    </div>
  );
}

describe('PostHogContext', () => {
  const originalKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const originalHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY = 'test-key';
    import.meta.env.VITE_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com';
  });

  afterEach(() => {
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY = originalKey;
    import.meta.env.VITE_PUBLIC_POSTHOG_HOST = originalHost;
  });

  describe('PostHogProvider', () => {
    it('devrait initialiser PostHog avec les bonnes options', () => {
      render(
        <PostHogProvider>
          <div>Test</div>
        </PostHogProvider>
      );

      expect(posthog.init).toHaveBeenCalledWith('test-key', {
        api_host: 'https://test.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          recordCrossOriginIframes: true,
        },
      });
    });

    it('ne devrait pas initialiser si les variables d\'environnement sont manquantes', () => {
      import.meta.env.VITE_PUBLIC_POSTHOG_KEY = '';
      import.meta.env.VITE_PUBLIC_POSTHOG_HOST = '';

      render(
        <PostHogProvider>
          <div>Test</div>
        </PostHogProvider>
      );

      expect(posthog.init).not.toHaveBeenCalled();
    });

    it('devrait rendre les enfants correctement', () => {
      render(
        <PostHogProvider>
          <div>Child Content</div>
        </PostHogProvider>
      );

      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('usePostHog hook', () => {
    it('devrait fournir la méthode trackEvent', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      render(
        <PostHogProvider>
          <TestComponent />
        </PostHogProvider>
      );

      const trackButton = screen.getByText('Track Event');
      await user.click(trackButton);

      expect(posthog.capture).toHaveBeenCalledWith('test_event', { prop: 'value' });
    });

    it('devrait fournir la méthode identify', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      render(
        <PostHogProvider>
          <TestComponent />
        </PostHogProvider>
      );

      const identifyButton = screen.getByText('Identify');
      await user.click(identifyButton);

      expect(posthog.identify).toHaveBeenCalledWith('user-123', { email: 'test@test.com' });
    });

    it('devrait fournir la méthode reset', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      render(
        <PostHogProvider>
          <TestComponent />
        </PostHogProvider>
      );

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      expect(posthog.reset).toHaveBeenCalled();
    });

    it('devrait lancer une erreur si utilisé en dehors du provider', () => {
      // Supprimer les logs d'erreur pour ce test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('usePostHog must be used within a PostHogProvider');

      consoleError.mockRestore();
    });
  });

  describe('trackEvent', () => {
    it('ne devrait pas crash si posthog n\'est pas initialisé', async () => {
      import.meta.env.VITE_PUBLIC_POSTHOG_KEY = '';
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      render(
        <PostHogProvider>
          <TestComponent />
        </PostHogProvider>
      );

      const trackButton = screen.getByText('Track Event');

      // Ne devrait pas lancer d'erreur lors du clic
      await expect(user.click(trackButton)).resolves.not.toThrow();
    });

    it('devrait gérer les événements sans propriétés', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      function SimpleTestComponent() {
        const { trackEvent } = usePostHog();
        return <button onClick={() => trackEvent('simple_event')}>Track</button>;
      }

      render(
        <PostHogProvider>
          <SimpleTestComponent />
        </PostHogProvider>
      );

      const trackButton = screen.getByText('Track');
      await user.click(trackButton);

      expect(posthog.capture).toHaveBeenCalledWith('simple_event', undefined);
    });
  });

  describe('identify', () => {
    it('devrait gérer l\'identification avec des propriétés complexes', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      function IdentifyTestComponent() {
        const { identify } = usePostHog();
        return (
          <button
            onClick={() =>
              identify('user-456', {
                email: 'user@example.com',
                role: 'PREMIUM',
                isPremium: true,
                credits: 10,
              })
            }
          >
            Identify User
          </button>
        );
      }

      render(
        <PostHogProvider>
          <IdentifyTestComponent />
        </PostHogProvider>
      );

      const identifyButton = screen.getByText('Identify User');
      await user.click(identifyButton);

      expect(posthog.identify).toHaveBeenCalledWith('user-456', {
        email: 'user@example.com',
        role: 'PREMIUM',
        isPremium: true,
        credits: 10,
      });
    });
  });
});
