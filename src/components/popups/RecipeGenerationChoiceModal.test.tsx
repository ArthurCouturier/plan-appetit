import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeGenerationChoiceModal from './RecipeGenerationChoiceModal';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Material Tailwind components
vi.mock('@material-tailwind/react', () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogBody: ({ children }: any) => <div data-testid="dialog-body">{children}</div>,
}));

// Helper pour wrapper avec Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RecipeGenerationChoiceModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.innerWidth pour les tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Affichage de base', () => {
    it('ne devrait pas s\'afficher quand isOpen est false', () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={false} onClose={mockOnClose} />
      );

      expect(screen.queryByText('Mode de génération')).not.toBeInTheDocument();
    });

    it('devrait afficher la modale quand isOpen est true', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Mode de génération')).toBeInTheDocument();
      });
    });

    it('devrait afficher les deux options de génération', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Création libre')).toBeInTheDocument();
        expect(screen.getByText('Création par localisation')).toBeInTheDocument();
      });
    });

    it('devrait afficher les descriptions des options', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Rapide et intuitif')).toBeInTheDocument();
        expect(screen.getByText('Personnalisé et précis')).toBeInTheDocument();
      });
    });
  });

  describe('Version Desktop (> 768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('devrait afficher le bouton Annuler sur desktop', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Annuler')).toBeInTheDocument();
      });
    });

    it('ne devrait PAS afficher la croix rouge sur desktop', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        const closeButtons = screen.queryAllByLabelText('Fermer');
        expect(closeButtons.length).toBe(0);
      });
    });

    it('devrait appeler onClose quand on clique sur Annuler', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Annuler')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Version Mobile (≤ 768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
    });

    it('ne devrait PAS afficher le bouton Annuler sur mobile', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
      });
    });

    it('devrait afficher la croix rouge sur mobile', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Fermer');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveClass('bg-red-500');
      });
    });

    it('devrait appeler onClose quand on clique sur la croix', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Fermer');
        expect(closeButton).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Fermer');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('devrait naviguer vers /recettes/generer/sandbox quand on clique sur Création libre', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Création libre')).toBeInTheDocument();
      });

      const sandboxButton = screen.getByText('Création libre').closest('button')!;
      await user.click(sandboxButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/recettes/generer/sandbox');
    });

    it('devrait naviguer vers /recettes/generer/localisation quand on clique sur Création par localisation', async () => {
      const user = await import('@testing-library/user-event').then(m => m.default.setup());

      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Création par localisation')).toBeInTheDocument();
      });

      const locationButton = screen.getByText('Création par localisation').closest('button')!;
      await user.click(locationButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/recettes/generer/localisation');
    });
  });

  describe('Responsive behavior', () => {
    it('devrait réagir au changement de taille de fenêtre', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      // Desktop first
      await waitFor(() => {
        expect(screen.getByText('Annuler')).toBeInTheDocument();
      });

      // Change to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir un bouton de fermeture avec aria-label sur mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Fermer');
        expect(closeButton).toHaveAttribute('aria-label', 'Fermer');
      });
    });

    it('les boutons de navigation devraient être accessibles', async () => {
      renderWithRouter(
        <RecipeGenerationChoiceModal isOpen={true} onClose={mockOnClose} />
      );

      await waitFor(() => {
        const sandboxButton = screen.getByText('Création libre').closest('button')!;
        const locationButton = screen.getByText('Création par localisation').closest('button')!;

        expect(sandboxButton).toBeInTheDocument();
        expect(locationButton).toBeInTheDocument();
      });
    });
  });
});
