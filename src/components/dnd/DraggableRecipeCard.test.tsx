import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggableRecipeCard from './DraggableRecipeCard';
import RecipeSummaryInterface from '../../api/interfaces/recipes/RecipeSummaryInterface';

const mockRecipe: RecipeSummaryInterface = {
    uuid: 'recipe-123',
    name: 'Test Recipe',
    covers: 4,
    stepsCount: 5,
    buyPrice: 12.50,
    isPublic: false,
    displayOrder: 0,
};

const renderWithProviders = (component: React.ReactNode, items: string[] = ['recipe-123']) => {
    return render(
        <BrowserRouter>
            <DndContext>
                <SortableContext items={items} strategy={rectSortingStrategy}>
                    {component}
                </SortableContext>
            </DndContext>
        </BrowserRouter>
    );
};

describe('DraggableRecipeCard', () => {
    describe('Desktop version', () => {
        it('devrait afficher le nom de la recette', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={false} />
            );

            expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        });

        it('devrait afficher le nombre de personnes', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={false} />
            );

            expect(screen.getByText('4 personnes')).toBeInTheDocument();
        });

        it('devrait afficher le nombre d\'\u00e9tapes', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={false} />
            );

            expect(screen.getByText('5 \u00e9tapes')).toBeInTheDocument();
        });

        it('devrait afficher le prix par personne', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={false} />
            );

            expect(screen.getByText('12.50\u20ac par personne')).toBeInTheDocument();
        });

        it('ne devrait pas afficher le prix si tr\u00e8s faible', () => {
            const recipeLowPrice: RecipeSummaryInterface = {
                ...mockRecipe,
                buyPrice: 0.001,
            };

            renderWithProviders(
                <DraggableRecipeCard recipe={recipeLowPrice} isMobile={false} />
            );

            expect(screen.queryByText(/par personne/)).not.toBeInTheDocument();
        });

        it('devrait afficher le bouton "Voir la recette"', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={false} />
            );

            expect(screen.getByText('Voir la recette')).toBeInTheDocument();
        });
    });

    describe('Mobile version', () => {
        it('devrait afficher le nom de la recette en version mobile', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={true} />
            );

            expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        });

        it('devrait afficher le nombre de personnes abr\u00e9g\u00e9', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={true} />
            );

            expect(screen.getByText('4 pers')).toBeInTheDocument();
        });

        it('devrait afficher le prix format\u00e9', () => {
            renderWithProviders(
                <DraggableRecipeCard recipe={mockRecipe} isMobile={true} />
            );

            expect(screen.getByText('12.50\u20ac/pers')).toBeInTheDocument();
        });
    });

    describe('Singulier/Pluriel', () => {
        it('devrait afficher "personne" au singulier', () => {
            const singleServing: RecipeSummaryInterface = {
                ...mockRecipe,
                covers: 1,
            };

            renderWithProviders(
                <DraggableRecipeCard recipe={singleServing} isMobile={false} />
            );

            expect(screen.getByText('1 personne')).toBeInTheDocument();
        });

        it('devrait afficher "\u00e9tape" au singulier', () => {
            const singleStep: RecipeSummaryInterface = {
                ...mockRecipe,
                stepsCount: 1,
            };

            renderWithProviders(
                <DraggableRecipeCard recipe={singleStep} isMobile={false} />
            );

            expect(screen.getByText('1 \u00e9tape')).toBeInTheDocument();
        });
    });
});
