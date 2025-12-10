# Configuration Capacitor - Plan Appetit

Ce document contient les instructions pour finaliser la configuration de Capacitor et déployer l'application mobile.

## Prérequis

### macOS
- **Xcode 16.0+** installé depuis l'App Store
- **CocoaPods** : `sudo gem install cocoapods`
- **Node.js 20+**

### Pour Android (optionnel)
- **Android Studio** avec SDK 34+
- **Java 17+**

---

## Étape 1 : Configurer Xcode (OBLIGATOIRE)

Exécuter cette commande dans le terminal pour pointer vers Xcode complet :

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Vérifier :
```bash
xcode-select -p
# Doit afficher : /Applications/Xcode.app/Contents/Developer
```

---

## Étape 2 : Installer CocoaPods (si pas déjà fait)

```bash
sudo gem install cocoapods
```

---

## Étape 3 : Synchroniser iOS

```bash
cd plan-appetit
npm run build
npx cap sync ios
```

Ou simplement :
```bash
npm run cap:ios
```

---

## Étape 4 : Tester sur Simulateur iOS

### Option A : Via Xcode (recommandé pour le premier test)

```bash
npm run cap:ios
```

Cela ouvre Xcode. Ensuite :
1. Sélectionner un simulateur (ex: iPhone 15 Pro)
2. Cliquer sur ▶️ (Play)

### Option B : Via terminal avec live reload

```bash
# Terminal 1 : Lancer le serveur de dev
npm run dev

# Terminal 2 : Lancer sur simulateur avec live reload
npm run cap:ios:live
```

---

## Étape 5 : Tester sur iPhone physique

### Prérequis
1. iPhone connecté en USB au Mac
2. Compte Apple (gratuit suffit pour le test)

### Étapes

1. Ouvrir Xcode :
   ```bash
   npm run cap:ios
   ```

2. Dans Xcode, aller dans **Signing & Capabilities** (clic sur le projet dans le navigateur gauche)

3. Configurer le signing :
   - Cocher ✅ "Automatically manage signing"
   - Team → Sélectionner ton Apple ID
   - Bundle Identifier → `fr.planappetit.app`

4. Sélectionner ton iPhone dans la liste des devices (en haut)

5. Cliquer sur ▶️ (Play)

6. **Première fois sur iPhone** :
   - Aller dans Réglages → Général → VPN et gestion des appareils
   - Faire confiance au développeur

### Live Reload sur iPhone

Pour voir les changements en temps réel sur ton iPhone :

1. Ton Mac et iPhone doivent être sur le **même réseau WiFi**

2. Modifier temporairement `capacitor.config.ts` :
   ```typescript
   server: {
     url: 'http://TON_IP_LOCALE:5173',
     cleartext: true
   }
   ```

3. Trouver ton IP locale :
   ```bash
   ipconfig getifaddr en0
   ```

4. Lancer :
   ```bash
   npm run dev
   npx cap run ios --livereload --external
   ```

5. **IMPORTANT** : Retirer la config `server.url` avant de builder pour production !

---

## Étape 6 : Tester sur Android (optionnel)

### Prérequis
- Android Studio installé
- Un émulateur Android configuré ou un device USB

### Commandes

```bash
# Ouvrir dans Android Studio
npm run cap:android

# Live reload
npm run cap:android:live
```

---

## Scripts NPM disponibles

| Script | Description |
|--------|-------------|
| `npm run cap:sync` | Synchronise le build web avec iOS et Android |
| `npm run cap:ios` | Build + sync + ouvre Xcode |
| `npm run cap:ios:live` | Lance sur iOS avec live reload |
| `npm run cap:android` | Build + sync + ouvre Android Studio |
| `npm run cap:android:live` | Lance sur Android avec live reload |
| `npm run cap:build` | Build web + sync toutes plateformes |

---

## Structure des fichiers Capacitor

```
plan-appetit/
├── capacitor.config.ts          # Configuration principale
├── ios/                          # Projet Xcode
│   └── App/
│       └── App/
│           ├── Info.plist        # Permissions iOS
│           └── PrivacyInfo.xcprivacy  # Privacy Manifest (App Store)
├── android/                      # Projet Android Studio
│   └── app/
│       └── src/main/
│           └── AndroidManifest.xml
└── src/api/services/
    ├── StorageService.ts         # Stockage unifié web/mobile
    └── PlatformService.ts        # Détection plateforme + APIs natives
```

---

## Services créés pour le mobile

### StorageService

Remplace `localStorage` de manière compatible mobile :

```typescript
import StorageService from '@/api/services/StorageService';

// Au lieu de localStorage.setItem('key', 'value')
await StorageService.set('key', 'value');

// Au lieu de localStorage.getItem('key')
const value = await StorageService.get('key');

// Pour les objets
await StorageService.setObject('user', { name: 'John' });
const user = await StorageService.getObject<User>('user');
```

### PlatformService

Détecte la plateforme et fournit les APIs natives :

```typescript
import PlatformService from '@/api/services/PlatformService';

// Détecter la plateforme
if (PlatformService.isNative()) {
  // Code spécifique mobile
}

// Haptic feedback
await PlatformService.hapticFeedback('medium');

// Vérifier la connexion
const online = await PlatformService.isOnline();

// Écouter les changements de réseau
PlatformService.onNetworkChange((connected) => {
  console.log('Connecté:', connected);
});
```

---

## Déploiement App Store

Voir le guide complet dans la conversation Claude Code pour :
1. Créer un compte Apple Developer (99€/an)
2. Configurer App Store Connect
3. Préparer les assets (icônes, screenshots)
4. Archiver et uploader depuis Xcode
5. Soumettre pour review

---

## Problèmes courants

### "xcode-select: error: tool 'xcodebuild' requires Xcode"

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### "CocoaPods is not installed"

```bash
sudo gem install cocoapods
cd ios/App && pod install
```

### L'app affiche un écran blanc

1. Vérifier que `npm run build` s'est bien exécuté
2. Vérifier que `dist/` contient les fichiers
3. Exécuter `npx cap sync ios`

### Live reload ne fonctionne pas sur iPhone

1. Vérifier que Mac et iPhone sont sur le même WiFi
2. Vérifier que le firewall du Mac autorise les connexions entrantes
3. Vérifier l'IP dans `capacitor.config.ts`
