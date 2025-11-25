import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DropPlaceholder from './DropPlaceholder';

describe('DropPlaceholder', () => {
    describe('Desktop version', () => {
        it('devrait afficher "Poser ici"', () => {
            render(<DropPlaceholder isMobile={false} />);

            expect(screen.getByText('Poser ici')).toBeInTheDocument();
        });

        it('devrait avoir la classe de bordure pointill\u00e9e', () => {
            const { container } = render(<DropPlaceholder isMobile={false} />);

            const placeholder = container.firstChild as HTMLElement;
            expect(placeholder).toHaveClass('border-dashed');
            expect(placeholder).toHaveClass('border-cout-base');
        });

        it('devrait avoir une hauteur minimale de 200px', () => {
            const { container } = render(<DropPlaceholder isMobile={false} />);

            const placeholder = container.firstChild as HTMLElement;
            expect(placeholder).toHaveClass('min-h-[200px]');
        });
    });

    describe('Mobile version', () => {
        it('devrait afficher "Poser ici" en mobile', () => {
            render(<DropPlaceholder isMobile={true} />);

            expect(screen.getByText('Poser ici')).toBeInTheDocument();
        });

        it('devrait avoir une hauteur minimale de 76px en mobile', () => {
            const { container } = render(<DropPlaceholder isMobile={true} />);

            const placeholder = container.firstChild as HTMLElement;
            expect(placeholder).toHaveClass('min-h-[76px]');
        });

        it('devrait prendre toute la largeur en mobile', () => {
            const { container } = render(<DropPlaceholder isMobile={true} />);

            const placeholder = container.firstChild as HTMLElement;
            expect(placeholder).toHaveClass('w-full');
        });
    });

    describe('Version par d\u00e9faut', () => {
        it('devrait utiliser la version desktop par d\u00e9faut', () => {
            const { container } = render(<DropPlaceholder />);

            const placeholder = container.firstChild as HTMLElement;
            expect(placeholder).toHaveClass('min-h-[200px]');
        });
    });
});
