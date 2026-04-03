# Instagram Import - Architecture

## Flow general

```
Instagram URL
    |
    v
[1. SCRAPING] InstagramService.getPostInfo()
    |-- Embed page (Googlebot UA, fallback browser UA)
    |-- Extrait: caption, username, imageUrl, videoUrl
    |-- Fallback video: page directe si /reel/ et pas de video_url dans embed
    |
    v
[2. DETECTION TYPE] Est-ce une video ou une photo ?
    |
    +-- PHOTO --> [3A. ANALYSE IMAGE]
    |                |
    |                v
    |            analyzeImageForPlating()
    |            Prompt: image-plating-system.txt
    |            Modele: gpt-4o-mini (vision)
    |            Cout: ~$0.001
    |                |
    |                v
    |            visualAnalysis (texte)
    |
    +-- VIDEO --> [3B. ANALYSE VIDEO]
                     |
                     +-- [3B.1] Telecharger video (.mp4)
                     |
                     +-- [3B.2] Scene detection (ffmpeg select='gt(scene,0.3)')
                     |          Resultat: ~5-12 timestamps de changement de scene
                     |          Fallback: interval fixe si < 3 scenes
                     |
                     +-- [3B.3] Extraire 1 frame par scene (ffmpeg -ss)
                     |
                     +-- [3B.4] Extraire audio (ffmpeg -> mp3)
                     |
                     +-- EN PARALLELE:
                     |   |
                     |   +-- [3B.5] CLASSIFICATION du contenu     <<< NOUVEAU
                     |   |   Prompt: video-classification-system.txt
                     |   |   Input: premiere + derniere frame
                     |   |   Modele: gpt-4o-mini (vision)
                     |   |   Output: "PREPARATION" ou "PRESENTATION"
                     |   |   Cout: ~$0.0005
                     |   |
                     |   +-- [3B.6] Transcription audio (Whisper)
                     |   |   Modele: whisper-1
                     |   |   Cout: ~$0.002/min
                     |   |
                     |   +-- [3B.7] Analyse des frames (selon approche)
                     |       |
                     |       +-- PARALLEL: 1 appel/frame, tous en parallele
                     |       |   Prompt: frame-analysis-system.txt (PREPARATION)
                     |       |        ou frame-composition-system.txt (PRESENTATION) <<< NOUVEAU
                     |       |   Modele: gpt-4o-mini (vision)
                     |       |   Cout: ~$0.001/frame
                     |       |
                     |       +-- BATCH: toutes les frames en 1 appel
                     |       |   Meme prompts, 1 seul appel
                     |       |   Cout: ~$0.003 total
                     |       |
                     |       +-- HYBRID (defaut): frames groupees par 5
                     |           Meme prompts, N/5 appels en parallele
                     |           Cout: ~$0.005 total
                     |           Fallback auto BATCH si rate limit 429 (10 min)
                     |
                     v
                 visualAnalysis (rapport ordonne) + audioTranscription
    |
    v
[4. DETECTION RECETTE DANS CAPTION]
    Prompt: recipe-detection-system.txt
    Modele: gpt-4o-mini
    Input: caption Instagram
    Output: OUI/NON
    Cout: ~$0.0001
    |
    +-- OUI (recette complete dans caption)
    |   |
    |   v
    |   [5A. EXTRACTION]
    |   Prompt: recipe-extraction-system.txt + recipe-extraction-user.txt
    |   Modele: gpt-4o-mini (structured output, JSON schema)
    |   Input: caption + visualAnalysis + audioTranscription
    |   Cout: ~$0.002
    |
    +-- NON (pas de recette dans caption)
        |
        v
        [5B. GENERATION]
        Prompt: recipe-generation-system.txt + recipe-generation-user.txt
        Modele: gpt-5-nano (structured output, JSON schema)
        Input: caption + visualAnalysis + audioTranscription
        Cout: ~$0.003
    |
    v
[6. SAUVEGARDE]
    Recipe entity + ingredients + steps
    Credits consommes, stats incrementees
    |
    v
[7. IMAGE] (async)
    |
    +-- Describe Instagram image (gpt-4o-mini vision) -> reference visuelle
    +-- Generate image (gpt-image-1-mini) avec reference dans le prompt
    Cout: ~$0.008
    |
    v
[8. LOG COUT TOTAL]
    OpenAICostTracker.summary()
```

## Fichiers de prompts

| Fichier | Utilise par | Modele | Description |
|---------|------------|--------|-------------|
| `frame-analysis-system.txt` | analyzeSingleFrame, batch | gpt-4o-mini | Analyse frame de video de PREPARATION (actions, ingredients, quantites) |
| `frame-composition-system.txt` | analyzeSingleFrame, batch | gpt-4o-mini | **NOUVEAU** - Analyse frame de video de PRESENTATION (composition du plat, textures, couches, deduction des ingredients) |
| `video-classification-system.txt` | classifyVideoContent | gpt-4o-mini | **NOUVEAU** - Determine si la video montre une preparation ou une presentation |
| `image-plating-system.txt` | analyzeImageForPlating | gpt-4o-mini | Analyse photo de plat (dressage, presentation) |
| `recipe-detection-system.txt` | hasCompleteRecipeInCaption | gpt-4o-mini | Detecte si la caption contient une recette complete |
| `recipe-extraction-system.txt` | extractRecipeFromCaption | gpt-4o-mini | Extrait une recette de la caption (mode extraction fidele) |
| `recipe-extraction-user.txt` | extractRecipeFromCaption | gpt-4o-mini | Template user avec {{caption}} et {{visual_section}} |
| `recipe-generation-system.txt` | generateRecipeFromDescription | gpt-5-nano | Genere une recette complete (mode creation) |
| `recipe-generation-user.txt` | generateRecipeFromDescription | gpt-5-nano | Template user avec {{caption}} et {{visual_section}} |

## Cout estime par import

| Scenario | Appels API | Cout estime |
|----------|-----------|-------------|
| Photo simple | 3 (plating + detection + generation) + image | ~$0.012 |
| Video preparation (~10 scenes, hybrid) | 5 (classif + 2 batch + audio + detection + generation) + image | ~$0.018 |
| Video presentation (~5 scenes, hybrid) | 4 (classif + 1 batch + audio + detection + generation) + image | ~$0.015 |
| Video longue batch (rate limited) | 3 (classif + 1 batch + audio + detection + generation) + image | ~$0.013 |

## Difference PREPARATION vs PRESENTATION

| | Video PREPARATION | Video PRESENTATION |
|---|---|---|
| Contenu | On voit les etapes de fabrication | On voit le plat fini, coupe, servi |
| Frame analysis | Decrire actions + ingredients utilises | Analyser composition, couches, textures |
| Prompt frame | `frame-analysis-system.txt` | `frame-composition-system.txt` |
| Source principale | Analyse visuelle des frames | Audio + expertise culinaire du modele |
| Generation | Reconstituer les etapes observees | Reverse-engineer la recette complete |
