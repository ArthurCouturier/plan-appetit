# Implémentation du Système i18n - Plan'Appetit

## 📋 Résumé

Un système de traduction complet a été mis en place pour supporter 7 langues avec persistance localStorage et détection automatique de la langue du navigateur.

---

## ✅ Ce qui a été créé

### 1. **Infrastructure i18n**

#### Fichiers créés :
- ✅ `src/contexts/LanguageContext.tsx` - Contexte React pour la gestion des langues
- ✅ `src/components/global/LanguageSelector.tsx` - Composant de sélection avec drapeaux
- ✅ `src/locales/fr.json` - Traductions françaises (**ÉTENDU**)
- ✅ `src/locales/en.json` - Traductions anglaises
- ✅ `src/locales/de.json` - Traductions allemandes
- ✅ `src/locales/es.json` - Traductions espagnoles
- ✅ `src/locales/it.json` - Traductions italiennes
- ✅ `src/locales/zh.json` - Traductions chinoises
- ✅ `src/locales/ja.json` - Traductions japonaises

#### Fichiers modifiés :
- ✅ `src/main.tsx` - `<LanguageProvider>` ajouté
- ✅ `src/pages/Account.tsx` - Sélecteur de langue intégré
- ✅ `src/pages/mobile/MyRecipesMobile.tsx` - **Exemple de conversion complète**

### 2. **Fonctionnalités implémentées**

✅ Détection automatique de la langue du navigateur  
✅ Persistance dans `localStorage` (clé: `app_language`)  
✅ Changement de langue en temps réel  
✅ Support de la pluralisation (`_plural`)  
✅ Support des paramètres dynamiques (`{{param}}`)  
✅ Fallback anglais si langue non supportée  
✅ Composant dropdown avec drapeaux emoji  

---

## 🔧 Clés de Traduction Ajoutées (fr.json)

### `common` (nouvelles clés)
```json
"soon": "bientôt",
"perMonth": "/mois",
"appearance": "Apparence"
```

### `generation` (labels mis à jour)
```json
"location": "Localité de la recette",
"locationPlaceholder": "La région Toulousaine",
"ingredients": "Centrer la recette autour d'ingrédients",
"ingredientsPlaceholder": "Le poireau et les légumineuses"
```

### `premium` (nouvelles clés)
```json
"recommended": "⭐ Recommandé",
"unlimitedGeneration": "Générations illimitées",
"exclusiveFeatures": "Personnalisation avancée",
"perfectToTry": "Parfait pour essayer",
"standardCustomization": "Personnalisation standard",
"generationCredits": "20 crédits de génération",
"premium": "Premium"
```

### `account` (nouvelles clés)
```json
"changePassword": "Changer le mot de passe",
"newPassword": "Nouveau mot de passe",
"passwordUpdated": "Mot de passe mis à jour",
"updating": "Mise à jour..."
```

---

## ⚠️ TODO - Actions Requises

### 1. **Synchroniser les fichiers JSON** (URGENT)

Les nouvelles clés ajoutées au `fr.json` doivent être ajoutées à **TOUS** les autres fichiers de langue :

| Fichier | Statut | Action |
|---------|--------|--------|
| `fr.json` | ✅ À jour | Aucune |
| `en.json` | ❌ Manque 11 clés | Ajouter traductions |
| `de.json` | ❌ Manque 11 clés | Ajouter traductions |
| `es.json` | ❌ Manque 11 clés | Ajouter traductions |
| `it.json` | ❌ Manque 11 clés | Ajouter traductions |
| `zh.json` | ❌ Manque 11 clés | Ajouter traductions |
| `ja.json` | ❌ Manque 11 clés | Ajouter traductions |

**Nouvelles clés à ajouter :**
- `common.soon`, `common.perMonth`, `common.appearance`
- `premium.recommended`, `premium.unlimitedGeneration`, `premium.exclusiveFeatures`, `premium.perfectToTry`, `premium.standardCustomization`, `premium.generationCredits`, `premium.premium`
- `account.changePassword`, `account.newPassword`, `account.passwordUpdated`, `account.updating`

### 2. **Convertir les fichiers TypeScript/TSX**

#### Pages Prioritaires (textes hardcodés à convertir)

```
📄 src/pages/RecipeGeneration.tsx
   - Labels de formulaires
   - Textes du modal de crédits
   - Bouton "Générer ma recette"

📄 src/pages/BecomePremium.tsx
   - Titres et sous-titres
   - Descriptions des plans
   - Boutons d'action

📄 src/pages/Account.tsx
   - Textes restants (changePassword, etc.)
   - Labels de formulaires

📄 src/pages/Login.tsx
   - Formulaire de connexion
   - Messages d'erreur

📄 src/pages/Home.tsx
   - Textes d'accueil
   - Descriptions des fonctionnalités

📄 src/pages/RecipeDetail.tsx
   - Labels d'affichage
   - Boutons d'action
```

#### Composants Prioritaires

```
🧩 src/components/cards/RecipeCard.tsx
   - Affichage prix, personnes, étapes
   - Textes dans les badges

🧩 src/components/global/Header.tsx
   - Titres de pages

🧩 src/components/fields/*.tsx
   - Labels et placeholders
```

---

## 📖 Guide de Conversion

### Étape 1 : Import du hook
```tsx
import { useLanguage } from '../contexts/LanguageContext';
```

### Étape 2 : Utiliser le hook
```tsx
const { t } = useLanguage();
```

### Étape 3 : Remplacer les textes

**AVANT :**
```tsx
<h1>Mes Recettes</h1>
<p>5 recettes dans votre livre</p>
<button>Créer une recette</button>
```

**APRÈS :**
```tsx
<h1>{t('recipes.myRecipes')}</h1>
<p>{t('recipes.recipeCount_plural', { count: 5 })}</p>
<button>{t('recipes.createRecipe')}</button>
```

### Cas Particuliers

#### Pluralisation
```tsx
{recipes.length > 1 
  ? t('recipes.recipeCount_plural', { count: recipes.length })
  : t('recipes.recipeCount', { count: recipes.length })}
```

#### Paramètres dynamiques
```tsx
t('recipes.costPerPerson', { cost: 12.50 })
// → "12.50€/pers"
```

#### Concaténation
```tsx
"Import Instagram (" + t('common.soon') + ")"
// → "Import Instagram (bientôt)"
```

---

## 🔍 Trouver les Textes à Convertir

### Commande de recherche
```bash
# Rechercher les chaînes qui commencent par une majuscule (probable texte hardcodé)
grep -r "\"[A-Z]" src/pages src/components --include="*.tsx" | grep -v "className"

# Rechercher les labels
grep -r "label={" src/ --include="*.tsx"

# Rechercher les placeholders
grep -r "placeholder={" src/ --include="*.tsx"
```

---

## ✨ Exemple Complet : MyRecipesMobile.tsx

Ce fichier a été entièrement converti et peut servir de référence :

```tsx
import { useLanguage } from "../../contexts/LanguageContext";

export default function MyRecipesMobile({ isMobile }: { isMobile: boolean }) {
  const { t } = useLanguage();
  const { recipes, setRecipes } = useRecipeContext();
  
  return (
    <div className="min-h-screen bg-bg-color p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {t('recipes.myRecipes')}
        </h1>
        <p className="text-text-secondary text-sm">
          {recipes.length > 0 
            ? t(recipes.length > 1 ? 'recipes.recipeCount_plural' : 'recipes.recipeCount', { count: recipes.length })
            : t('recipes.emptyBook')}
        </p>
      </div>

      {/* Bouton créer */}
      <button>{t('recipes.createRecipe')}</button>
      
      {/* État vide */}
      <h3>{t('recipes.noRecipes')}</h3>
      <p>{t('recipes.noRecipesDesc')}</p>
      <button>{t('recipes.generateRecipe')}</button>
    </div>
  );
}
```

---

## 🎯 Workflow Recommandé

### 1. **Synchroniser les traductions** (30 min)
- Copier les nouvelles clés de `fr.json` dans tous les autres fichiers
- Traduire chaque clé dans la langue appropriée
- Vérifier que tous les fichiers ont le même nombre de lignes

### 2. **Convertir page par page** (2-3h)
- Commencer par `RecipeGeneration.tsx` (page complexe)
- Continuer avec `BecomePremium.tsx`
- Puis les composants (`RecipeCard.tsx`)
- Terminer avec les pages simples (`Login.tsx`, `Home.tsx`)

### 3. **Tester** (30 min)
- Lancer l'app : `npm run dev`
- Tester chaque langue dans le sélecteur
- Vérifier que tout s'affiche correctement
- Tester la persistence (recharger la page)

### 4. **Commit** (10 min)
```bash
git add src/locales src/contexts src/components src/pages
git commit -m "feat: implement i18n system with 7 languages"
```

---

## 📊 Estimation du Travail Restant

| Tâche | Temps estimé | Priorité |
|-------|--------------|----------|
| Synchroniser les 6 fichiers JSON | 30 min | 🔴 Haute |
| Convertir RecipeGeneration.tsx | 45 min | 🔴 Haute |
| Convertir BecomePremium.tsx | 30 min | 🟠 Moyenne |
| Convertir RecipeCard.tsx | 20 min | 🟠 Moyenne |
| Convertir Account.tsx (restant) | 15 min | 🟡 Basse |
| Convertir autres pages | 1-2h | 🟡 Basse |
| **TOTAL** | **3-4h** | |

---

## 🚀 Commandes Utiles

```bash
# Démarrer le dev
npm run dev

# Compter les lignes dans les fichiers de traduction
wc -l src/locales/*.json

# Trouver les textes non traduits
grep -r '"[A-Z]' src/pages --include="*.tsx" | wc -l

# Vérifier les imports manquants
grep -r "useLanguage" src/pages --include="*.tsx"
```

---

## 📝 Notes Importantes

1. ⚠️ **NE PAS mélanger les clés** - Toujours utiliser la structure hiérarchique (`section.key`)
2. ⚠️ **Tester après chaque conversion** - Une erreur de clé peut casser l'app
3. ⚠️ **Garder les emoji dans les traductions** - Ils font partie de l'UX (✨, 🇫🇷, etc.)
4. ✅ **Les paramètres dynamiques** doivent utiliser `{{param}}` dans les JSON
5. ✅ **La pluralisation** utilise automatiquement `_plural` si count > 1

---

## 🎉 Avantages du Système

✅ **7 langues supportées** - FR, EN, DE, ES, IT, ZH, JA  
✅ **Détection automatique** - Langue du navigateur au premier lancement  
✅ **Persistance** - Le choix est sauvegardé  
✅ **Changement instantané** - Pas besoin de recharger  
✅ **Maintenabilité** - Toutes les traductions centralisées  
✅ **Évolutivité** - Facile d'ajouter de nouvelles langues  
✅ **Type-safe** - Warnings si clé manquante  

---

## 📚 Documentation Complète

Voir `TRANSLATION_GUIDE.md` pour la documentation technique détaillée du système.

---

**Statut actuel :** Système fonctionnel avec infrastructure complète ✅  
**Prochaine étape :** Synchroniser les fichiers JSON puis convertir les pages prioritaires  
**Dernière mise à jour :** 14 octobre 2025
