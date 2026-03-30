---
name: Fix Instagram Import
description: Plan de correction des problèmes identifiés sur l'import Instagram
status: en cours
created: 2026-03-29
---

# Fix Instagram Import - Plan

## Problèmes identifiés

### 1. Les posts video (reels) ne fonctionnent pas
**Statut** : FAIT
**Priorite** : Haute
**Description** : L'import d'un reel Instagram (ex: `/reel/XXX/`) echouait car Instagram servait une coquille SPA (JavaScript only, sans contenu) au lieu du HTML SSR quand le User-Agent ressemblait a un navigateur moderne. Les photos fonctionnaient par chance avec l'ancien UA.
**Cause racine** : Le User-Agent `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36` recevait du SSR pour les photos mais du SPA pour les reels.
**Fix applique** : (`InstagramService.kt`)
- Ajout d'une liste de User-Agents avec fallback (Googlebot en premier, ancien UA en second)
- Boucle qui teste chaque UA et verifie que le HTML contient du contenu reel (`EmbeddedMediaImage`, `CaptionUsername`, ou `og:image`)
- Si aucun UA ne retourne de SSR, erreur explicite
**Exemples** :
- Photo (OK) : `https://www.instagram.com/p/DWYUNx4DFn3/`
- Video (OK apres fix) : `https://www.instagram.com/reel/DWMcNWWCCYD/`

### 2. Double appel inutile au scraping Instagram
**Statut** : A FAIRE
**Priorité** : Moyenne
**Description** : Le front appelle `/fetch` dans `handleDisplay` (InstagramImport.tsx:92), mais le resultat n'est pas utilise pour la generation. Ensuite `/generate-recipe` refait `instagramService.getPostInfo(url)` (InstagramController.kt:87). C'est 2 requetes HTTP vers Instagram pour le meme post.
**Solution proposee** : Supprimer l'appel `/fetch` du `handleDisplay` cote front. Le front n'en a pas besoin pour afficher l'embed (qui utilise le script Instagram). Le backend fait deja le scraping dans `/generate-recipe`.

### 3. `fetchImageAsBase64` et `imageBase64` jamais utilises
**Statut** : A FAIRE
**Priorite** : Basse
**Description** : `InstagramService.ts:76-88` contient une methode `fetchImageAsBase64` jamais appelee. Le parametre `imageBase64` de `generateRecipeFromPost` est optionnel et jamais passe. Le controller backend ne lit pas non plus ce champ.
**Solution proposee** : Supprimer la methode `fetchImageAsBase64` et le parametre `imageBase64` du front.

### 4. `incrementInstagramRecipes` manquant dans le controller
**Statut** : A FAIRE
**Priorite** : Moyenne
**Description** : Le controller appelle `incrementTotalGeneratedRecipes` et `incrementImportedRecipes` mais pas `incrementInstagramRecipes` (qui existe dans `StatisticsService`). La stat Instagram n'est donc jamais incrementee.
**Solution proposee** : Ajouter `statisticsService.incrementInstagramRecipes(user)` dans `InstagramController.generateRecipeFromInstagram()`.

### 5. Endpoint `/fetch` sans authentification
**Statut** : A FAIRE
**Priorite** : Basse
**Description** : N'importe qui peut scraper des posts Instagram via `/api/v1/instagram/fetch` sans token Firebase. Risque d'abus.
**Solution proposee** : Soit ajouter l'authentification, soit supprimer l'endpoint si on retire l'appel `/fetch` du front (cf point 2). Si on le garde pour un usage futur, ajouter les headers `Email` et `Authorization`.

### 6. State `generatedRecipe` inutile
**Statut** : A FAIRE
**Priorite** : Basse
**Description** : Le state `generatedRecipe` (InstagramImport.tsx:27) n'est jamais effectivement utilise pour l'affichage. L'utilisateur est redirige immediatement via `navigate`. Le state sert uniquement a desactiver le bouton via `!!generatedRecipe`, mais le `navigate` se fait avant que ce state ne soit mis a jour.
**Solution proposee** : Supprimer le state `generatedRecipe` et simplifier la logique du bouton.
