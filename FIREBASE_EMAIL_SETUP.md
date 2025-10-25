# Configuration des Templates d'Email Firebase

Ce document explique comment configurer les templates d'email personnalisés dans Firebase pour Plan Appetit.

## Template disponible

- `firebase-email-template.html` : Template pour la réinitialisation du mot de passe

## Comment appliquer le template dans Firebase

### 1. Accéder aux templates Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet **plan-appetit**
3. Dans le menu de gauche : **Authentication** → **Templates**

### 2. Configurer le template de réinitialisation de mot de passe

1. Sélectionnez **Password reset** (Réinitialisation du mot de passe)
2. Cliquez sur l'icône de crayon ✏️ pour éditer

#### Configuration de base

- **From name** (Nom de l'expéditeur) : `Plan Appetit`
- **Reply-to email** : Votre email de support (ex: `support@planappetit.com`)

#### Configuration du template email

Firebase propose deux modes :
- **Mode Simple** : Éditeur WYSIWYG avec options limitées
- **Mode Avancé** : Éditeur HTML complet

**Pour utiliser notre template personnalisé :**

1. Cliquez sur **"Customize template"** ou **"Personnaliser le modèle"**
2. Basculez en mode **HTML** (si disponible)
3. Copiez le contenu de `firebase-email-template.html`
4. Collez-le dans l'éditeur Firebase
5. Cliquez sur **Save** (Enregistrer)

#### Variables Firebase disponibles

Le template utilise ces variables Firebase qui seront automatiquement remplacées :

- `%LINK%` : Lien de réinitialisation du mot de passe (obligatoire)
- `%EMAIL%` : Email de l'utilisateur
- `%APP_NAME%` : Nom de l'application (Plan Appetit)

**Important :** Ne supprimez jamais la variable `%LINK%` du template, elle est essentielle pour la réinitialisation.

### 3. Autres templates disponibles dans Firebase

Vous pouvez également personnaliser ces templates :

#### Email verification (Vérification d'email)
- Envoyé lors de l'inscription pour vérifier l'email
- Variable principale : `%LINK%`

#### Email change (Changement d'email)
- Envoyé quand un utilisateur change son email
- Variables : `%LINK%`, `%EMAIL%`, `%NEW_EMAIL%`

#### SMS verification (Vérification SMS)
- Pour l'authentification à deux facteurs
- Variable : `%APP_NAME%`, `%LOGIN_CODE%`

### 4. Tester le template

#### Option 1 : Test direct
1. Allez sur votre application Plan Appetit
2. Page de connexion → Entrez votre email
3. Cliquez sur "Mot de passe oublié ?"
4. Vérifiez votre boîte email (et les spams)

#### Option 2 : Test via Firebase Console
1. **Authentication** → **Users**
2. Sélectionnez un utilisateur
3. Cliquez sur les trois points → **Send password reset email**

### 5. Personnalisation du template

Le template actuel utilise :
- **Couleurs** : Dégradé violet (#667eea → #764ba2)
- **Police** : System fonts (compatible tous navigateurs)
- **Responsive** : Compatible mobile et desktop

Pour personnaliser :
1. Modifiez `firebase-email-template.html` localement
2. Adaptez les couleurs, textes, style selon vos besoins
3. Copiez le nouveau code dans Firebase Console

#### Éléments personnalisables

```html
<!-- Couleur du header -->
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

<!-- Couleur du bouton -->
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

<!-- Textes -->
Modifiez directement le contenu HTML
```

### 6. Bonnes pratiques

- **Ne supprimez jamais** la variable `%LINK%`
- **Testez toujours** le template avant de le déployer
- **Gardez le HTML simple** pour une meilleure compatibilité email
- **Utilisez des tableaux** pour la mise en page (standard email)
- **Évitez le JavaScript** (non supporté dans les emails)
- **Utilisez des styles inline** pour une meilleure compatibilité

### 7. Limitations Firebase

- Firebase ne permet pas d'héberger des images dans les emails
- Si vous voulez un logo, vous devez l'héberger ailleurs (ex: CDN, votre serveur)
- Les styles CSS externes ne fonctionnent pas
- Certains clients email peuvent ne pas afficher les dégradés CSS

### 8. Dépannage

#### L'email n'arrive pas
- Vérifiez les spams
- Vérifiez que l'email existe dans **Authentication → Users**
- Vérifiez les quotas dans **Authentication → Usage**

#### Le template ne s'affiche pas correctement
- Vérifiez que le HTML est valide
- Testez avec différents clients email (Gmail, Outlook, etc.)
- Assurez-vous que tous les styles sont inline

#### Le lien ne fonctionne pas
- Vérifiez que la variable `%LINK%` est présente
- Vérifiez que votre domaine est autorisé dans **Authentication → Settings → Authorized domains**

## Support

Pour toute question sur la configuration Firebase, consultez :
- [Documentation Firebase Authentication](https://firebase.google.com/docs/auth)
- [Personnaliser les emails Firebase](https://firebase.google.com/docs/auth/custom-email-handler)
