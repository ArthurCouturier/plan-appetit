---
name: Fix Instagram Import
description: Plan de correction et d'amelioration de l'import Instagram
status: en cours
created: 2026-03-29
updated: 2026-03-30
---

# Fix Instagram Import - Plan

## Corrections appliquees

### 1. Les posts video (reels) ne fonctionnent pas - FAIT
**Cause** : Instagram servait du SPA au lieu du SSR selon le User-Agent.
**Fix** : User-Agent Googlebot en premier + fallback. Extraction `srcset` pour les images CDN.

### 2. `incrementInstagramRecipes` manquant - FAIT
**Fix** : Ajoute dans `InstagramController.generateRecipeFromInstagram()`.

### 3. Nesting depth 1001 sur la reponse - FAIT
**Fix** : Reponse simplifiee avec `mapOf("uuid", "name")` au lieu de l'entite JPA complete.

### 4. Token refresh automatique - FAIT
**Fix** : `InstagramService.ts` utilise `fetchWithTokenRefresh` au lieu de `fetch`.

### 5. LazyInitializationException image generation - FAIT
**Fix** : `TransactionTemplate` + `Hibernate.initialize()` dans `ImageGenerationService`.

### 6. Code mort supprime - FAIT
- `fetchImageAsBase64` et parametre `imageBase64` supprimes du front
- Methodes `create*Prompt` inline supprimees (remplacees par fichiers externes)

## Ameliorations appliquees

### Analyse video par frames
- Detection de scene ffmpeg (`select='gt(scene,0.3)'`) au lieu d'un fps fixe
- Non-premium : 1 frame par changement de scene
- Premium : 2 frames par scene (debut + 0.5s apres)
- Fallback si < 3 scenes : interval fixe (2s si <= 30s, 4s si > 30s)
- Analyse parallele avec `CachedThreadPool` (autant de threads que de frames)

### Transcription audio (Whisper)
- Extraction audio MP3 via ffmpeg
- Transcription via Whisper API (langue fr)
- Ajoutee au contexte de generation de la recette

### Debug admin
- Modal debug visible uniquement pour les admins apres generation
- Affiche : frames extraites, analyses par frame, transcription audio
- Navigation vers la recette depuis la modal

### Progression SSE temps reel
- Endpoint SSE `/generation-progress` au lieu de polling
- Barre de progression avec etapes : download, extraction, analyse frame X/Y, generation
- Simulation 90->99% pendant la generation finale (1%/700ms, bloque a 99)

### Image de recette referencee Instagram
- `ImageGenerationService` decrit l'image Instagram via GPT-4o-mini
- Description injectee dans le prompt DALL-E pour que l'image generee ressemble au post

### Prompts externalises
- `PromptService` avec substitution `{{variable}}`
- Fichiers dans `src/main/resources/prompts/instagram/`
- Permet d'iterer les prompts sans modifier le code Kotlin

## Approches documentees (pour comparaison future)

### Approche A : Analyse par frame en parallele (ACTUELLE)
- Chaque frame est analysee individuellement par GPT-4o-mini
- Toutes les analyses en parallele via CachedThreadPool
- **Avantages** : granularite fine, barre de progression detaillee
- **Inconvenients** : beaucoup d'appels API, risque de rate limit avec beaucoup de frames
- **Cout** : ~$0.01-0.03 par import (selon nombre de frames)

### Approche B : Analyse batch en un seul appel
- Toutes les frames envoyees dans un seul appel GPT-4o-mini
- **Avantages** : 1 seul appel, pas de rate limit, vision d'ensemble, plus rapide
- **Inconvenients** : moins granulaire, pas de progression par frame
- **Cout** : ~$0.005 par import
- **Note** : a considerer si les rate limits posent probleme en production

### Approche C : Hybride (a explorer)
- Batch pour l'analyse visuelle + per-frame pour les details
- Ou batch avec response structuree par timestamp

## Reste a faire

### Double appel scraping Instagram
**Priorite** : Moyenne
Le front appelle `/fetch` dans `handleDisplay` mais le resultat n'est pas utilise. `/generate-recipe` refait le scraping.
**Solution** : Supprimer l'appel `/fetch` du `handleDisplay` front.

### Endpoint `/fetch` sans authentification
**Priorite** : Basse
**Solution** : Ajouter auth ou supprimer si on retire l'appel `/fetch` du front.

### State `generatedRecipe` inutile
**Priorite** : Basse
**Solution** : Supprimer le state et simplifier la logique du bouton.
