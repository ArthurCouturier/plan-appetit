# Intégration des Documents Légaux dans Plan Appetit

## ✅ Ce qui a été créé

### 1. Documents juridiques (format Markdown)
📁 `public/legal/`
- `CGU.md` - Conditions Générales d'Utilisation
- `POLITIQUE_CONFIDENTIALITE.md` - Politique de Confidentialité (RGPD)
- `MENTIONS_LEGALES.md` - Mentions Légales
- `CGV.md` - Conditions Générales de Vente
- `README_LEGAL.md` - Guide pour compléter les documents

### 2. Composants React (pages)
📁 `src/pages/legal/`
- `CGU.tsx` - Page CGU
- `PolitiqueConfidentialite.tsx` - Page Politique
- `MentionsLegales.tsx` - Page Mentions Légales
- `CGV.tsx` - Page CGV
- `index.ts` - Export des composants

## 🚀 Étapes d'intégration

### Étape 1 : Compléter les documents Markdown

1. Ouvrez le fichier `public/legal/README_LEGAL.md`
2. Suivez les instructions pour remplacer toutes les mentions `[...]`
3. Vérifiez que vous avez bien :
   - Votre nom / raison sociale
   - Votre SIRET
   - Votre adresse
   - Votre email et téléphone
   - Les informations de votre hébergeur
   - Choisi un médiateur de la consommation
   - Défini vos tarifs (dans CGV.md)

### Étape 2 : Ajouter les routes dans votre application

Ouvrez votre fichier de routing (probablement `src/App.tsx` ou `src/router.tsx`) et ajoutez les routes :

```typescript
import { CGUPage, PolitiqueConfidentialitePage, MentionsLegalesPage, CGVPage } from './pages/legal';

// Dans votre router, ajoutez :
<Route path="/legal/cgu" element={<CGUPage />} />
<Route path="/legal/politique-de-confidentialite" element={<PolitiqueConfidentialitePage />} />
<Route path="/legal/mentions-legales" element={<MentionsLegalesPage />} />
<Route path="/legal/cgv" element={<CGVPage />} />
```

### Étape 3 : Créer un Footer avec les liens légaux

Créez un composant `Footer.tsx` dans `src/components/global/Footer.tsx` :

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';

export default function Footer() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Typography
                        variant="small"
                        className="text-gray-600"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        © {new Date().getFullYear()} Plan Appetit. Tous droits réservés.
                    </Typography>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/legal/cgu"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            CGU
                        </Link>
                        <Link
                            to="/legal/cgv"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            CGV
                        </Link>
                        <Link
                            to="/legal/politique-de-confidentialite"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Confidentialité
                        </Link>
                        <Link
                            to="/legal/mentions-legales"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Mentions Légales
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
```

### Étape 4 : Ajouter le Footer dans votre Layout principal

Dans votre composant Layout principal (ou `App.tsx`), ajoutez le Footer :

```typescript
import Footer from './components/global/Footer';

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Votre contenu existant */}
            <Footer />
        </div>
    );
}
```

### Étape 5 : Ajouter les liens lors de l'inscription

Dans votre page `Login.tsx` (mode inscription), ajoutez une case à cocher pour accepter les CGU :

```typescript
// Dans le formulaire d'inscription, avant le bouton "S'inscrire"
<div className="flex items-start gap-2">
    <input
        type="checkbox"
        id="acceptCGU"
        checked={acceptedCGU}
        onChange={(e) => setAcceptedCGU(e.target.checked)}
        required
        className="mt-1"
    />
    <label htmlFor="acceptCGU" className="text-sm text-gray-700">
        J'accepte les{' '}
        <Link to="/legal/cgu" target="_blank" className="text-blue-600 hover:underline">
            Conditions Générales d'Utilisation
        </Link>
        {' '}et la{' '}
        <Link to="/legal/politique-de-confidentialite" target="_blank" className="text-blue-600 hover:underline">
            Politique de Confidentialité
        </Link>
    </label>
</div>
```

N'oubliez pas d'ajouter l'état :
```typescript
const [acceptedCGU, setAcceptedCGU] = useState<boolean>(false);
```

Et de désactiver le bouton d'inscription si les CGU ne sont pas acceptées :
```typescript
<Button
    type="submit"
    disabled={loading || !passwordStrength.isValid || !passwordsMatch || !acceptedCGU}
    fullWidth
>
    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
</Button>
```

### Étape 6 : Ajouter les liens lors du paiement Premium

Dans votre page de checkout/paiement Stripe, ajoutez une case à cocher :

```typescript
<div className="flex items-start gap-2 mb-4">
    <input
        type="checkbox"
        id="acceptCGV"
        checked={acceptedCGV}
        onChange={(e) => setAcceptedCGV(e.target.checked)}
        required
    />
    <label htmlFor="acceptCGV" className="text-sm text-gray-700">
        J'accepte les{' '}
        <Link to="/cgv" target="_blank" className="text-blue-600 hover:underline">
            Conditions Générales de Vente
        </Link>
        {' '}et renonce à mon droit de rétractation pour bénéficier de l'accès immédiat au service Premium
    </label>
</div>
```

## 📋 Checklist finale

Avant de publier votre application en production :

- [ ] Tous les documents Markdown sont complétés (plus de `[...]`)
- [ ] Les routes sont ajoutées dans le router
- [ ] Le Footer est créé et affiché sur toutes les pages
- [ ] La case à cocher CGU est présente lors de l'inscription
- [ ] La case à cocher CGV est présente lors du paiement
- [ ] Vous avez testé tous les liens
- [ ] Les documents sont accessibles publiquement
- [ ] Vous avez choisi et contacté un médiateur de la consommation
- [ ] Les coordonnées de contact sont correctes

## ⚠️ Obligations légales

### Obligatoire dès maintenant
- ✅ **Mentions Légales** : Obligatoire pour tout site web
- ✅ **Politique de Confidentialité** : Obligatoire si vous collectez des données (RGPD)

### Recommandé
- ✅ **CGU** : Fortement recommandé pour protéger votre service

### Obligatoire si vous vendez
- ✅ **CGV** : Obligatoire si vous proposez un abonnement payant
- ✅ **Case à cocher acceptation CGV** : Avant le paiement
- ✅ **Médiateur de la consommation** : Coordonnées obligatoires dans les CGV

## 🎨 Personnalisation

Vous pouvez personnaliser le style des pages légales en modifiant les composants dans `src/pages/legal/`.

Les couleurs actuelles utilisent votre palette Material Tailwind existante.

## 📞 Support

Si vous avez des questions sur ces documents juridiques :

1. **Technique** : Les composants React et l'intégration
2. **Juridique** : Consultez un avocat spécialisé ou un service comme LegalPlace, Captain Contrat

## 🔄 Mises à jour

Pensez à :
- Mettre à jour la date en haut de chaque document lors de modifications
- Informer vos utilisateurs par email des changements importants
- Garder une archive des versions précédentes

---

**Bon courage pour la finalisation de vos documents légaux ! 🎉**
