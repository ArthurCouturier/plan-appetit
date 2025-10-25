# POLITIQUE DE CONFIDENTIALITÉ
# Plan Appetit

**Date de dernière mise à jour : 22/10/2025**

---

## 1. INTRODUCTION

La protection de vos données personnelles est une priorité pour Plan Appetit.

Cette Politique de Confidentialité vous informe sur la manière dont nous collectons, utilisons, stockons et protégeons vos données personnelles, conformément au **Règlement Général sur la Protection des Données (RGPD)** et à la loi Informatique et Libertés.

**Responsable du traitement :**
**Raison sociale :** Couturier Arthur
**Forme juridique :** Entreprise individuelle (Auto-entrepreneur)
**SIRET :** 930959572 00023
**Numéro de TVA :** FR20930959572

---

## 2. DONNÉES PERSONNELLES COLLECTÉES

### 2.1 Données collectées lors de l'inscription

Lorsque vous créez un compte sur Plan Appetit, nous collectons :

**Avec authentification par email :**
- Adresse email
- Mot de passe (chiffré via Firebase Authentication)
- Date de création du compte

**Avec authentification Google (via Firebase) :**
- Adresse email
- Nom d'affichage (nom Google)
- Photo de profil Google (URL)
- Identifiant unique Firebase (UID)

### 2.2 Données d'utilisation

Lors de votre utilisation de Plan Appetit, nous collectons :
- Les recettes que vous générez ou créez
- Les paramètres de génération (localisation, saison, ingrédients, allergènes, budget, préférences végan)
- Le nombre de recettes générées
- Le statut de votre compte (MEMBER ou PREMIUM)
- Les avantages premium (quota de recettes restant)
- L'historique de vos connexions
- Les données de navigation (via Firebase Analytics)

### 2.3 Données de paiement

Si vous souscrivez à un abonnement Premium :
- Les données de paiement sont **collectées et traitées exclusivement par Stripe** (notre prestataire de paiement)
- Plan Appetit **ne stocke jamais** vos coordonnées bancaires
- Nous recevons uniquement une confirmation de paiement et un identifiant de transaction

### 2.4 Cookies et technologies similaires

Plan Appetit utilise :
- **Firebase Authentication** : tokens de session pour vous maintenir connecté
- **Firebase Analytics** : statistiques d'utilisation anonymisées
- **LocalStorage** : stockage local de vos préférences et token d'authentification

---

## 3. FINALITÉS DU TRAITEMENT

Vos données personnelles sont utilisées pour :

### 3.1 Gestion de votre compte
- Création et authentification de votre compte
- Gestion de votre profil utilisateur
- Réinitialisation de mot de passe
- Communication relative à votre compte

**Base légale :** Exécution du contrat (CGU)

### 3.2 Fourniture du service
- Génération de recettes personnalisées via l'IA
- Sauvegarde et gestion de vos recettes
- Gestion de vos quotas de génération
- Accès aux fonctionnalités Premium

**Base légale :** Exécution du contrat (CGU)

### 3.3 Gestion des paiements
- Traitement des paiements Premium via Stripe
- Gestion de votre abonnement
- Facturation et historique des transactions

**Base légale :** Exécution du contrat (CGV)

### 3.4 Amélioration du service
- Analyse statistique de l'utilisation (anonymisée)
- Détection et résolution de bugs
- Développement de nouvelles fonctionnalités

**Base légale :** Intérêt légitime

### 3.5 Communication
- Envoi d'emails liés au service (réinitialisation de mot de passe, confirmations)
- Notifications importantes concernant le service

**Base légale :** Exécution du contrat

**⚠️ Plan Appetit ne vous envoie pas d'emails marketing sans votre consentement explicite.**

---

## 4. DESTINATAIRES DES DONNÉES

Vos données personnelles sont transmises aux destinataires suivants :

### 4.1 Prestataires techniques

| Prestataire | Service | Données transmises | Localisation |
|------------|---------|-------------------|--------------|
| **Firebase (Google)** | Authentification, base de données | Email, nom, photo de profil, UID | USA (Privacy Shield) |
| **OpenAI** | Génération de recettes par IA | Paramètres de recettes (pas de données personnelles identifiantes) | USA |
| **Stripe** | Paiements | Nom, email, données de paiement | UE / USA |

### 4.2 Transferts hors UE

Certains de nos prestataires (Firebase, OpenAI, Stripe) sont situés aux États-Unis.

Ces transferts sont encadrés par :
- **Clauses contractuelles types** de la Commission européenne
- **Privacy Shield** (ou équivalent)
- **Clauses de protection des données** dans les contrats avec les prestataires

### 4.3 Aucune vente de données

**Plan Appetit ne vend jamais vos données personnelles à des tiers.**

---

## 5. DURÉE DE CONSERVATION

Vos données sont conservées pour les durées suivantes :

| Type de données | Durée de conservation |
|----------------|----------------------|
| **Compte actif** | Tant que votre compte est actif |
| **Compte inactif** | 2 ans après la dernière connexion, puis suppression |
| **Recettes** | Tant que votre compte existe |
| **Logs de connexion** | 12 mois |
| **Données de paiement** | 10 ans (obligation légale comptable) - stockées par Stripe uniquement |
| **Données de facturation** | 10 ans (obligation légale) |

Vous pouvez demander la suppression anticipée de vos données à tout moment (voir section 7).

---

## 6. SÉCURITÉ DES DONNÉES

Plan Appetit met en œuvre des mesures de sécurité pour protéger vos données :

### 6.1 Mesures techniques
- **Chiffrement des mots de passe** via Firebase Authentication (bcrypt)
- **Connexion HTTPS** (certificat SSL/TLS)
- **Tokens d'authentification sécurisés** (JWT Firebase)
- **Base de données sécurisée** (PostgreSQL avec accès restreint)
- **Sauvegardes régulières** de la base de données

### 6.2 Mesures organisationnelles
- Accès aux données limité au strict nécessaire
- Authentification forte pour l'accès aux serveurs
- Mises à jour régulières des systèmes de sécurité

### 6.3 En cas de violation de données

En cas de violation de sécurité affectant vos données personnelles, Plan Appetit s'engage à :
- Notifier la CNIL dans les 72 heures
- Vous informer par email si la violation présente un risque élevé pour vos droits

---

## 7. VOS DROITS (RGPD)

Conformément au RGPD, vous disposez des droits suivants :

### 7.1 Droit d'accès (Art. 15 RGPD)
Vous pouvez demander l'accès à toutes les données personnelles que nous détenons sur vous.

### 7.2 Droit de rectification (Art. 16 RGPD)
Vous pouvez demander la correction de données inexactes ou incomplètes.

### 7.3 Droit à l'effacement / "Droit à l'oubli" (Art. 17 RGPD)
Vous pouvez demander la suppression de vos données personnelles.

**Comment faire :**
- Via les paramètres de votre compte : bouton "Supprimer mon compte"
- Par email à arthur.couturier@plan-appetit.fr

**Délai de traitement :** 30 jours maximum

### 7.4 Droit à la portabilité (Art. 20 RGPD)
Vous pouvez récupérer vos données dans un format structuré, couramment utilisé et lisible par machine (JSON).

### 7.5 Droit d'opposition (Art. 21 RGPD)
Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct.

### 7.6 Droit à la limitation du traitement (Art. 18 RGPD)
Vous pouvez demander la limitation du traitement de vos données dans certaines circonstances.

### 7.7 Comment exercer vos droits ?

**Par email :** arthur.couturier@plan-appetit.fr

**Par courrier :**
Couturier Arthur
20 port Saint Sauveur, 31400, Toulouse, France

**Documents requis :**
- Copie d'une pièce d'identité (pour vérifier votre identité)
- Description précise de votre demande

**Délai de réponse :** 1 mois maximum (prolongeable à 3 mois si la demande est complexe)

---

## 8. COOKIES

### 8.1 Cookies utilisés

Plan Appetit utilise uniquement des **cookies techniques essentiels** :

| Cookie | Finalité | Durée |
|--------|---------|-------|
| Firebase Authentication Token | Maintenir votre session | Session |
| LocalStorage data | Préférences et recettes en cache | Permanent (jusqu'à suppression) |

### 8.2 Firebase Analytics

Nous utilisons Firebase Analytics pour collecter des statistiques d'usage anonymisées :
- Pages visitées
- Temps passé sur l'application
- Actions effectuées (génération de recettes, etc.)

Ces données sont **anonymisées** et ne permettent pas de vous identifier personnellement.

### 8.3 Désactivation des cookies

Vous pouvez désactiver les cookies via les paramètres de votre navigateur, mais cela empêchera le fonctionnement de Plan Appetit (impossible de rester connecté).

---

## 9. DROITS SPÉCIFIQUES AUX MINEURS

Plan Appetit n'est pas destiné aux enfants de moins de 15 ans.

Si vous êtes un parent et que vous découvrez que votre enfant nous a fourni des informations personnelles sans votre consentement, contactez-nous immédiatement à arthur.couturier@plan-appetit.fr pour que nous supprimions ces données.

---

## 10. MODIFICATIONS DE LA POLITIQUE

Plan Appetit peut modifier cette Politique de Confidentialité à tout moment.

Les modifications entrent en vigueur dès leur publication.

Vous serez informé des modifications importantes par :
- Email
- Notification dans l'application
- Bannière sur le site

La date de dernière mise à jour est indiquée en haut de ce document.

---

## 11. RÉCLAMATION AUPRÈS DE LA CNIL

Si vous estimez que Plan Appetit ne respecte pas vos droits, vous pouvez introduire une réclamation auprès de la CNIL :

**Commission Nationale de l'Informatique et des Libertés (CNIL)**
- Adresse : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07
- Téléphone : 01 53 73 22 22
- Site web : https://www.cnil.fr
- Formulaire en ligne : https://www.cnil.fr/fr/plaintes

---

## 12. CONTACT - DÉLÉGUÉ À LA PROTECTION DES DONNÉES

Pour toute question concernant vos données personnelles ou cette politique de confidentialité :

**Email :** arthur.couturier@plan-appetit.fr

**Courrier :**
Couturier Arthur
20 port Saint Sauveur, 31400, Toulouse, France

**Délai de réponse :** Nous nous engageons à vous répondre dans un délai de 30 jours maximum.

---

**Date de dernière mise à jour : 22/10/2025**

**Version : 1.0**
