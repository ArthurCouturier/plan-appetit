# État de Conversion i18n

## ✅ Fichiers Convertis

### Contextes & Services
- ✅ `src/contexts/LanguageContext.tsx` - Créé
- ✅ `src/components/global/LanguageSelector.tsx` - Créé
- ✅ `src/main.tsx` - LanguageProvider ajouté

### Pages
- ✅ `src/pages/mobile/MyRecipesMobile.tsx` - Converti (exemple)
- ✅ `src/pages/Account.tsx` - LanguageSelector ajouté

## 🔄 Fichiers à Convertir (Prioritaires)

### Pages Principales
- ⏳ `src/pages/RecipeGeneration.tsx`
- ⏳ `src/pages/BecomePremium.tsx`
- ⏳ `src/pages/desktop/RecipesDesktop.tsx`
- ⏳ `src/pages/desktop/HomeDesktop.tsx`
- ⏳ `src/pages/Home.tsx`
- ⏳ `src/pages/Login.tsx`
- ⏳ `src/pages/RecipeDetail.tsx`

### Composants
- ⏳ `src/components/cards/RecipeCard.tsx`
- ⏳ `src/components/global/Header.tsx`
- ⏳ `src/components/fields/*.tsx` (TextualField, etc.)

## 📝 Clés de Traduction Ajoutées

### `common`
- `soon`, `perMonth`, `appearance`

### `generation`
- Tous les labels et placeholders mis à jour

### `premium`
- `recommended`, `premium`, `generationCredits`
- `perfectToTry`, `standardCustomization`
- `unlimitedGeneration` → "Générations illimitées"

### `account`
- `changePassword`, `newPassword`, `passwordUpdated`, `updating`

## 🔧 Template de Conversion

### Avant
```tsx
function MyComponent() {
  return (
    <div>
      <h1>Mes Recettes</h1>
      <button>Créer une recette</button>
    </div>
  );
}
```

### Après
```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('recipes.myRecipes')}</h1>
      <button>{t('recipes.createRecipe')}</button>
    </div>
  );
}
```

## ⚠️ Notes Importantes

1. **Toutes les langues doivent être mises à jour** en même temps que le français
2. **Tester la génération** après chaque conversion majeure
3. **Les placeholders** dans les champs doivent aussi être traduits
4. **Les messages d'erreur** doivent utiliser `t('errors.X')`

## 🚀 Prochaines Étapes

1. ✅ Mettre à jour tous les fichiers JSON de traduction avec les nouvelles clés
2. ⏳ Convertir RecipeGeneration.tsx
3. ⏳ Convertir BecomePremium.tsx  
4. ⏳ Convertir RecipeCard.tsx
5. ⏳ Convertir Account.tsx (textes restants)
6. ⏳ Convertir les autres pages

## 📌 Commandes Utiles

```bash
# Rechercher tous les textes hardcodés restants
grep -r "\"[A-Z]" src/pages src/components --include="*.tsx"

# Vérifier les fichiers modifiés
git status

# Tester l'application
npm run dev
```
