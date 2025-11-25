import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import DroppableCollectionCard from './DroppableCollectionCard';
import RecipeCollectionInterface from '../../api/interfaces/collections/RecipeCollectionInterface';

const mockCollection: RecipeCollectionInterface = {
    uuid: 'collection-123',
    name: 'Ma Collection',
    level: 1,
    isPublic: false,
    isDefault: false,
    displayOrder: 0,
    createdAt: '2025-01-01T00:00:00Z',
    lastUpdated: '2025-01-01T00:00:00Z',
    recipes: [
        { uuid: 'recipe-1', name: 'Recipe 1', covers: 4, stepsCount: 3, buyPrice: 10, isPublic: false, displayOrder: 0 },
        { uuid: 'recipe-2', name: 'Recipe 2', covers: 2, stepsCount: 5, buyPrice: 15, isPublic: false, displayOrder: 1 },
    ],
    subCollections: [
        { uuid: 'sub-1', name: 'Sub 1', level: 2, isPublic: false, isDefault: false, displayOrder: 0, createdAt: '2025-01-01T00:00:00Z', lastUpdated: '2025-01-01T00:00:00Z', recipes: [], subCollections: [] },
    ],
};

const renderWithProviders = (
    component: React.ReactNode,
    items: string[] = ['collection-collection-123']
) => {
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

describe('DroppableCollectionCard', () => {
    describe('Desktop version', () => {
        it('devrait afficher le nom de la collection', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('Ma Collection')).toBeInTheDocument();
        });

        it('devrait afficher le nombre de recettes', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('2 recettes')).toBeInTheDocument();
        });

        it('devrait afficher le nombre de sous-collections', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('1 sous-collection')).toBeInTheDocument();
        });

        it('devrait afficher le bouton "Voir la collection"', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('Voir la collection')).toBeInTheDocument();
        });

        it('devrait afficher l\'ic\u00f4ne de collection priv\u00e9e', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            const privateIcon = document.querySelector('.bg-cout-purple\\/20');
            expect(privateIcon).toBeInTheDocument();
        });

        it('devrait afficher l\'ic\u00f4ne de collection publique', () => {
            const publicCollection = { ...mockCollection, isPublic: true };

            renderWithProviders(
                <DroppableCollectionCard
                    collection={publicCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            const publicIcon = document.querySelector('.bg-green-500\\/20');
            expect(publicIcon).toBeInTheDocument();
        });
    });

    describe('Mobile version', () => {
        it('devrait afficher le nom de la collection en mobile', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={true}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('Ma Collection')).toBeInTheDocument();
        });

        it('devrait afficher le nombre de recettes en mobile', () => {
            renderWithProviders(
                <DroppableCollectionCard
                    collection={mockCollection}
                    isMobile={true}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('2 recettes')).toBeInTheDocument();
        });
    });

    describe('Singulier/Pluriel', () => {
        it('devrait afficher "recette" au singulier', () => {
            const singleRecipeCollection = {
                ...mockCollection,
                recipes: [mockCollection.recipes![0]],
            };

            renderWithProviders(
                <DroppableCollectionCard
                    collection={singleRecipeCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('1 recette')).toBeInTheDocument();
        });

        it('devrait afficher "sous-collections" au pluriel', () => {
            const multiSubCollection: RecipeCollectionInterface = {
                ...mockCollection,
                subCollections: [
                    ...mockCollection.subCollections!,
                    { uuid: 'sub-2', name: 'Sub 2', level: 2, isPublic: false, isDefault: false, displayOrder: 1, createdAt: '2025-01-01T00:00:00Z', lastUpdated: '2025-01-01T00:00:00Z', recipes: [], subCollections: [] },
                ],
            };

            renderWithProviders(
                <DroppableCollectionCard
                    collection={multiSubCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('2 sous-collections')).toBeInTheDocument();
        });

        it('ne devrait pas afficher les sous-collections si aucune', () => {
            const noSubCollection = {
                ...mockCollection,
                subCollections: [],
            };

            renderWithProviders(
                <DroppableCollectionCard
                    collection={noSubCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.queryByText(/sous-collection/)).not.toBeInTheDocument();
        });
    });

    describe('Collection vide', () => {
        it('devrait afficher 0 recettes', () => {
            const emptyCollection = {
                ...mockCollection,
                recipes: [],
                subCollections: [],
            };

            renderWithProviders(
                <DroppableCollectionCard
                    collection={emptyCollection}
                    isMobile={false}
                    isDraggingItem={false}
                />
            );

            expect(screen.getByText('0 recette')).toBeInTheDocument();
        });
    });
});
