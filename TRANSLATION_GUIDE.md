# Guide du Système de Traduction (i18n)

## 📚 Vue d'ensemble

Plan'Appetit utilise un système de traduction personnalisé basé sur React Context, permettant de supporter 7 langues :

- 🇫🇷 Français (fr)
- 🇬🇧 Anglais (en)  
- 🇩🇪 Allemand (de)
- 🇪🇸 Espagnol (es)
- 🇮🇹 Italien (it)
- 🇨🇳 Chinois (zh)
- 🇯🇵 Japonais (ja)

## 🗂️ Structure des fichiers

```
src/
├── locales/
│   ├── fr.json
│   ├── en.json
│   ├── de.json
│   ├── es.json
│   ├── it.json
│   ├── zh.json
│   └── ja.json
├── contexts/
│   └── LanguageContext.tsx
└── components/
    └── global/
        └── LanguageSelector.tsx
```

## 🚀 Utilisation

### 1. Dans un composant

```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('recipes.myRecipes')}</h1>
      <p>{t('recipes.recipeCount', { count: 5 })}</p>
    </div>
  );
}
```

### 2. Clés de traduction

Les clés suivent une structure hiérarchique avec des points :

```
common.loading          → "Loading..."
recipes.myRecipes       → "My Recipes"
generation.title        → "Recipe Generation (AI)"
```

### 3. Paramètres dynamiques

Utilisez `{{param}}` dans les fichiers JSON :

```json
{
  "recipes": {
    "costPerPerson": "€{{cost}}/pers"
  }
}
```

Et passez les valeurs dans le code :

```tsx
t('recipes.costPerPerson', { cost: 12.50 })
// → "€12.50/pers"
```

### 4. Pluralisation

Ajoutez `_plural` à la clé pour la forme plurielle :

```json
{
  "recipes": {
    "recipeCount": "{{count}} recipe in your book",
    "recipeCount_plural": "{{count}} recipes in your book"
  }
}
```

Le système choisit automatiquement selon `count` :

```tsx
t('recipes.recipeCount', { count: 1 })  // → "1 recipe in your book"
t('recipes.recipeCount', { count: 5 })  // → "5 recipes in your book"
```

## 🎯 Sélecteur de langue

Le composant `LanguageSelector` affiche un dropdown avec des drapeaux emoji :

```tsx
import LanguageSelector from '../components/global/LanguageSelector';

function MyPage() {
  return <LanguageSelector />;
}
```

## 💾 Persistance

- La langue choisie est sauvegardée dans `localStorage` sous la clé `app_language`
- Au premier chargement, la langue du navigateur est détectée automatiquement
- Si la langue du navigateur n'est pas supportée, l'anglais est utilisé par défaut

## 📝 Ajouter une nouvelle traduction

### 1. Ajouter la clé dans tous les fichiers JSON

**fr.json**
```json
{
  "mySection": {
    "newKey": "Nouveau texte"
  }
}
```

**en.json**
```json
{
  "mySection": {
    "newKey": "New text"
  }
}
```

### 2. Utiliser dans le code

```tsx
const { t } = useLanguage();
return <p>{t('mySection.newKey')}</p>;
```

## 🔄 Migration d'une page existante

### Avant
```tsx
function MyPage() {
  return (
    <div>
      <h1>Mes Recettes</h1>
      <p>Créer une recette</p>
    </div>
  );
}
```

### Après
```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyPage() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('recipes.myRecipes')}</h1>
      <p>{t('recipes.createRecipe')}</p>
    </div>
  );
}
```

## 🛠️ API du hook `useLanguage`

```tsx
const {
  language,      // Langue actuelle: 'fr' | 'en' | 'de' | 'es' | 'it' | 'zh' | 'ja'
  setLanguage,   // Fonction pour changer la langue
  t,             // Fonction de traduction
  languages      // Configuration de toutes les langues
} = useLanguage();
```

## ✅ Exemple complet

```tsx
import { useLanguage } from '../../contexts/LanguageContext';

export default function MyRecipesMobile() {
  const { t } = useLanguage();
  const recipes = [/* ... */];

  return (
    <div>
      <h1>{t('recipes.myRecipes')}</h1>
      <p>
        {recipes.length > 0 
          ? t(
              recipes.length > 1 
                ? 'recipes.recipeCount_plural' 
                : 'recipes.recipeCount', 
              { count: recipes.length }
            )
          : t('recipes.emptyBook')}
      </p>
      <button>{t('recipes.createRecipe')}</button>
    </div>
  );
}
```

## 🌐 Langues supportées

| Code | Langue    | Drapeau | Détection navigateur |
|------|-----------|---------|---------------------|
| fr   | Français  | 🇫🇷     | fr, fr-FR, fr-CA... |
| en   | English   | 🇬🇧     | en, en-US, en-GB... |
| de   | Deutsch   | 🇩🇪     | de, de-DE, de-AT... |
| es   | Español   | 🇪🇸     | es, es-ES, es-MX... |
| it   | Italiano  | 🇮🇹     | it, it-IT...        |
| zh   | 中文      | 🇨🇳     | zh, zh-CN, zh-TW... |
| ja   | 日本語    | 🇯🇵     | ja, ja-JP...        |

## 📦 Fichiers modifiés

Pour implémenter ce système, les fichiers suivants ont été créés/modifiés :

### Créés
- `src/locales/*.json` (7 fichiers)
- `src/contexts/LanguageContext.tsx`
- `src/components/global/LanguageSelector.tsx`

### Modifiés
- `src/main.tsx` (ajout du LanguageProvider)
- `src/pages/Account.tsx` (ajout du LanguageSelector)
- `src/pages/mobile/MyRecipesMobile.tsx` (exemple de conversion)

## 🎨 Personnalisation

Pour ajouter une nouvelle langue :

1. Créer `src/locales/xx.json` avec toutes les traductions
2. Ajouter la config dans `LanguageContext.tsx` :

```tsx
export const LANGUAGE_CONFIG = {
  // ...
  xx: { name: 'LanguageName', flag: '🏴', translations: xx },
};
```

3. Ajouter le type dans `Language` :

```tsx
export type Language = 'fr' | 'en' | 'de' | 'es' | 'it' | 'zh' | 'ja' | 'xx';
```
