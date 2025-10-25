# Guide pour compléter vos documents légaux

Vous avez maintenant 4 documents juridiques pour votre application Plan Appetit :

1. **CGU.md** - Conditions Générales d'Utilisation
2. **POLITIQUE_CONFIDENTIALITE.md** - Politique de confidentialité (RGPD)
3. **MENTIONS_LEGALES.md** - Mentions légales
4. **CGV.md** - Conditions Générales de Vente (abonnement Premium)

## 📝 Informations à compléter

Recherchez les mentions `[...]` dans chaque document et remplacez-les par vos informations :

### Informations obligatoires

| Champ | Exemple | Où le trouver |
|-------|---------|---------------|
| `[DATE]` | 22 octobre 2024 | Date du jour |
| `[VOTRE NOM]` | Arthur Couturier | Votre nom complet |
| `[VOTRE SIRET]` | 123 456 789 00012 | INSEE / Votre déclaration d'auto-entrepreneur |
| `[VOTRE ADRESSE]` | 12 rue de la République, 75001 Paris | Adresse de domiciliation de votre entreprise |
| `[VOTRE EMAIL]` | contact@planappetit.fr | Email professionnel |
| `[VOTRE TÉLÉPHONE]` | +33 6 12 34 56 78 | Téléphone professionnel |
| `[VOTRE URL]` | https://planappetit.fr | URL de votre application |

### Informations sur l'hébergement

| Champ | Exemple | Description |
|-------|---------|-------------|
| `[NOM DE L'HÉBERGEUR]` | OVH, Hostinger, AWS, etc. | Nom de votre hébergeur |
| `[ADRESSE DE L'HÉBERGEUR]` | 2 rue Kellermann, 59100 Roubaix | Adresse légale de l'hébergeur |
| `[TÉLÉPHONE DE L'HÉBERGEUR]` | 1007 | Trouvé sur le site de l'hébergeur |
| `[URL DE L'HÉBERGEUR]` | https://www.ovh.com | Site web de l'hébergeur |
| `[LOCALISATION]` | France, UE, USA | Où sont situés les serveurs |

### Informations sur les prix (CGV uniquement)

Dans `CGV.md`, définissez vos tarifs Premium :

```markdown
**Abonnement mensuel**
- Prix : [9,99 €] TTC / mois

**Abonnement annuel**
- Prix : [99,99 €] TTC / an
- Économie de [16%] par rapport au mensuel

**Abonnement à vie**
- Prix : [299,99 €] TTC (paiement unique)
```

## 🔍 Vérifications à effectuer

### 1. Cohérence des informations

Assurez-vous que les informations sont identiques dans les 4 documents :
- ✅ Nom / Raison sociale
- ✅ SIRET
- ✅ Adresse
- ✅ Email
- ✅ Téléphone

### 2. TVA

En tant qu'auto-entrepreneur sous le régime de la franchise en base de TVA :
- ✅ Vérifiez la mention "TVA non applicable - article 293 B du CGI"
- ✅ N'ajoutez pas de numéro de TVA intracommunautaire (sauf si vous avez dépassé les seuils)

### 3. Liens internes

Remplacez les liens entre documents :

## ⚠️ Points d'attention juridiques

### 1. RGPD et Politique de Confidentialité

**Obligatoire si vous collectez des données personnelles (email, nom, etc.)**

Points importants :
- ✅ Vous devez être en conformité avec le RGPD
- ✅ Conservez les données uniquement le temps nécessaire
- ✅ Permettez aux utilisateurs d'exercer leurs droits (accès, suppression, portabilité)
- ✅ Sécurisez les données (Firebase vous aide déjà)

### 2. Mentions Légales

**Obligatoire pour tout site web commercial**

Points importants :
- ✅ SIRET obligatoire pour les auto-entrepreneurs
- ✅ Coordonnées de l'hébergeur obligatoires
- ✅ Directeur de publication (vous-même)

### 3. CGU

**Recommandé pour encadrer l'utilisation de votre service**

Points importants :
- ✅ Décrit les services offerts
- ✅ Définit les responsabilités de chacun
- ✅ Protection juridique en cas de litige

### 4. CGV

**Obligatoire si vous vendez un service (abonnement Premium)**

Points importants :
- ✅ Prix TTC obligatoire
- ✅ Droit de rétractation de 14 jours (avec exceptions pour les services numériques)
- ✅ Médiateur de la consommation obligatoire

## 📋 Checklist avant publication

Avant de publier votre application avec ces documents :

- [ ] J'ai remplacé toutes les mentions `[...]` par mes informations
- [ ] J'ai vérifié mon numéro de SIRET
- [ ] J'ai indiqué les coordonnées de mon hébergeur
- [ ] J'ai choisi un médiateur de la consommation
- [ ] J'ai défini mes tarifs dans les CGV
- [ ] J'ai relu tous les documents pour vérifier la cohérence
- [ ] J'ai créé les pages web correspondantes dans mon application
- [ ] Les liens entre les documents sont corrects
- [ ] La date de mise à jour est correcte

## 🚀 Intégration dans l'application

Une fois les documents complétés, vous devez les rendre accessibles aux utilisateurs :

### Option 1 : Pages dédiées (recommandé)

Créez des routes dans votre application React :
- `/cgu` → Affiche CGU.md
- `/politique-confidentialite` → Affiche POLITIQUE_CONFIDENTIALITE.md
- `/mentions-legales` → Affiche MENTIONS_LEGALES.md
- `/cgv` → Affiche CGV.md

### Option 2 : Footer avec liens

Ajoutez un footer sur toutes les pages avec des liens vers ces documents.

### Option 3 : Modal / Popup

Affichez ces documents dans des modales lors de l'inscription ou avant le paiement.

## ⚖️ Conseils juridiques

**⚠️ Disclaimer : Ces documents sont fournis à titre informatif. Ils ne constituent pas un conseil juridique.**

**Recommandations :**
1. **Faites relire vos documents par un avocat** si possible (facultatif mais recommandé)
2. **Utilisez un médiateur agréé** pour la médiation de la consommation
3. **Mettez à jour régulièrement** vos documents en cas de changement d'activité
4. **Conservez une preuve** de l'acceptation des CGU/CGV par vos utilisateurs
5. **Informez vos utilisateurs** en cas de modification des conditions

## 📞 Ressources utiles

### Organismes officiels

- **CNIL** (protection des données) : https://www.cnil.fr
- **INPI** (propriété intellectuelle) : https://www.inpi.fr
- **DGCCRF** (consommation) : https://www.economie.gouv.fr/dgccrf

### Outils en ligne

- **Générateur de CGU** : https://www.legalplace.fr
- **Vérificateur RGPD** : https://www.cnil.fr/fr/rgpd-passer-a-laction

### Médiateurs de la consommation

- **CM2C** : https://www.cm2c.net
- **AME** : https://www.mediationconso-ame.com
- **FEVAD** : https://www.mediateurfevad.fr

## 🔄 Mise à jour des documents

**Quand mettre à jour vos documents ?**

- Changement d'adresse professionnelle
- Changement de tarifs
- Ajout de nouvelles fonctionnalités
- Changement d'hébergeur
- Modification de la politique de données
- Évolution de la réglementation

**Comment faire ?**
1. Modifiez les fichiers .md
2. Mettez à jour la date en haut du document
3. Incrémentez la version (ex: v1.0 → v1.1)
4. Informez vos utilisateurs par email des changements importants
5. Republiez sur votre site

## ✅ Validation finale

Une fois tout complété :

```bash
# Vérifiez qu'il ne reste aucun placeholder
grep -r "\[VOTRE" public/legal/
grep -r "\[DATE\]" public/legal/
grep -r "\[NOM" public/legal/
grep -r "\[LIEN" public/legal/

# Si la commande ne retourne rien, c'est bon ! ✅
```

## 💼 Besoin d'aide ?

Ces documents sont des modèles génériques adaptés à Plan Appetit.

Pour une validation juridique complète, consultez :
- Un avocat spécialisé en droit du numérique
- Un service juridique en ligne (LegalPlace, Captain Contrat, etc.)
- La Chambre de Commerce et d'Industrie (CCI)

---

**Bon courage pour la finalisation de vos documents légaux ! 🎉**

**N'oubliez pas : mieux vaut prendre le temps de bien faire les choses maintenant que d'avoir des problèmes juridiques plus tard.**
