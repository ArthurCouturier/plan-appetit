# Guide de Délivrabilité Email - Plan Appetit

## Problème actuel
Les emails de réinitialisation Firebase arrivent dans les spams car :
- Utilisation de `noreply@[projet].firebaseapp.com` (domaine non contrôlé)
- Pas de configuration SPF/DKIM personnalisée
- Réputation d'envoi partagée avec tous les projets Firebase

## Solutions recommandées

### ⭐ Option 1 : Firebase Extensions + SendGrid (RECOMMANDÉ)

**Avantages :**
- Configuration SPF/DKIM automatique
- Taux de délivrabilité élevé (>95%)
- Gratuit jusqu'à 100 emails/jour
- Statistiques d'envoi détaillées

**Inconvénients :**
- Nécessite le plan Firebase Blaze (pay-as-you-go)
- Configuration initiale plus complexe

#### Étapes d'installation

1. **Passer au plan Blaze (si ce n'est pas déjà fait)**
   - Firebase Console → Upgrade
   - Définir un budget mensuel (ex: 10€) pour éviter les surprises
   - Les 100 premiers emails/jour restent gratuits

2. **Créer un compte SendGrid**
   - Allez sur [SendGrid](https://sendgrid.com)
   - Créez un compte gratuit
   - Vérifiez votre email
   - Récupérez votre API Key dans Settings → API Keys

3. **Installer l'extension Firebase**
   ```bash
   # Via la console Firebase
   Extensions → Browse Extensions → "Trigger Email from Firestore"

   # OU via Firebase CLI
   firebase ext:install firestore-send-email
   ```

4. **Configurer l'extension**
   - SMTP Connection URI : `smtps://apikey:[VOTRE_SENDGRID_API_KEY]@smtp.sendgrid.net:465`
   - Default FROM : `noreply@votredomaine.com`
   - Firestore Collection : `mail`

5. **Modifier le code d'envoi d'email**

   Au lieu d'utiliser `sendPasswordResetEmail`, vous devrez :
   - Générer un lien de réinitialisation personnalisé
   - Enregistrer l'email dans Firestore
   - L'extension l'enverra automatiquement

**Limitation :** Cette approche nécessite de réécrire la logique de réinitialisation de mot de passe. Firebase ne permet pas d'utiliser SendGrid pour les emails d'authentification par défaut (signInWithEmailAndPassword, etc.).

---

### 💡 Option 2 : Backend Spring Boot + Service Email (FLEXIBLE)

**Avantages :**
- Contrôle total sur l'envoi d'emails
- Choix du service d'envoi (SendGrid, Mailgun, AWS SES, etc.)
- Personnalisation complète
- Pas de dépendance Firebase

**Inconvénients :**
- Nécessite de gérer les tokens de réinitialisation manuellement
- Plus de code à maintenir
- Sécurité à gérer vous-même

#### Architecture recommandée

```
Frontend (React)
    ↓
Backend Spring Boot
    ↓
Service Email (SendGrid/Mailgun/AWS SES)
    ↓
Utilisateur reçoit l'email
```

#### Implémentation Spring Boot

**1. Ajouter les dépendances (pom.xml)**
```xml
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.9.3</version>
</dependency>
```

**2. Créer une entité PasswordResetToken**
```kotlin
@Entity
data class PasswordResetToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val token: String,
    val email: String,
    val expiryDate: LocalDateTime,
    var used: Boolean = false
)
```

**3. Service d'envoi d'email**
```kotlin
@Service
class EmailService(
    @Value("\${sendgrid.api.key}")
    private val sendGridApiKey: String
) {
    fun sendPasswordResetEmail(email: String, resetLink: String) {
        val from = Email("noreply@planappetit.com")
        val to = Email(email)
        val subject = "Réinitialisation de votre mot de passe - Plan Appetit"

        // Utiliser votre template HTML personnalisé
        val content = Content("text/html", generateEmailTemplate(resetLink, email))

        val mail = Mail(from, subject, to, content)

        val sg = SendGrid(sendGridApiKey)
        val request = Request()
        request.method = Method.POST
        request.endpoint = "mail/send"
        request.body = mail.build()

        sg.api(request)
    }

    private fun generateEmailTemplate(link: String, email: String): String {
        // Lire firebase-email-template.html
        // Remplacer %LINK% et %EMAIL%
        return template
    }
}
```

**4. Controller de réinitialisation**
```kotlin
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val emailService: EmailService,
    private val tokenRepository: PasswordResetTokenRepository,
    private val firebaseService: FirebaseService
) {
    @PostMapping("/forgot-password")
    fun forgotPassword(@RequestBody request: ForgotPasswordRequest): ResponseEntity<*> {
        // Générer un token unique
        val token = UUID.randomUUID().toString()
        val expiryDate = LocalDateTime.now().plusHours(1)

        // Sauvegarder le token
        tokenRepository.save(
            PasswordResetToken(
                token = token,
                email = request.email,
                expiryDate = expiryDate
            )
        )

        // Créer le lien de réinitialisation
        val resetLink = "https://votredomaine.com/reset-password?token=$token"

        // Envoyer l'email
        emailService.sendPasswordResetEmail(request.email, resetLink)

        return ResponseEntity.ok(mapOf("message" to "Email envoyé"))
    }

    @PostMapping("/reset-password")
    fun resetPassword(@RequestBody request: ResetPasswordRequest): ResponseEntity<*> {
        val tokenEntity = tokenRepository.findByToken(request.token)
            ?: return ResponseEntity.badRequest().body("Token invalide")

        if (tokenEntity.used || tokenEntity.expiryDate.isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expiré")
        }

        // Mettre à jour le mot de passe Firebase
        firebaseService.updateUserPassword(tokenEntity.email, request.newPassword)

        tokenEntity.used = true
        tokenRepository.save(tokenEntity)

        return ResponseEntity.ok(mapOf("message" to "Mot de passe mis à jour"))
    }
}
```

**5. Créer la page de réinitialisation frontend**
- Nouvelle page `/reset-password`
- Récupère le token depuis l'URL
- Formulaire pour entrer le nouveau mot de passe
- Appelle l'API backend

**Limitation :** Cette approche nécessite de gérer manuellement la mise à jour du mot de passe Firebase, ce qui peut être complexe car Firebase Auth n'expose pas d'API backend pour cela directement.

---

### 🔧 Option 3 : Solutions rapides (TEMPORAIRE)

En attendant de mettre en place une solution complète :

**1. Ajouter un message dans l'interface**
```typescript
// Dans Login.tsx après le succès
setResetPasswordSuccess(
    'Un email de réinitialisation a été envoyé. ⚠️ Vérifiez vos spams si vous ne le trouvez pas.'
);
```

**2. Documentation utilisateur**
Créer une FAQ avec :
- "Je ne reçois pas l'email de réinitialisation"
- "Vérifiez vos spams"
- "Ajoutez noreply@[projet].firebaseapp.com à vos contacts"

**3. Améliorer le template email**
- ✅ Déjà fait avec le template HTML personnalisé
- Éviter les mots spam
- Bon ratio texte/HTML
- Pas de liens courts

---

## Comparaison des options

| Critère | Firebase Extensions | Backend personnalisé | Solution rapide |
|---------|-------------------|---------------------|----------------|
| **Coût** | Gratuit (100/j) puis $$ | Gratuit (100/j) puis $$ | Gratuit |
| **Complexité** | Moyenne | Élevée | Faible |
| **Délivrabilité** | Excellente (95%+) | Excellente (95%+) | Faible (60%) |
| **Temps d'implémentation** | 2-3h | 1-2 jours | 5 min |
| **Flexibilité** | Moyenne | Élevée | Faible |
| **Maintenance** | Faible | Moyenne | Nulle |

---

## Ma recommandation

**Pour une application en production :**
→ **Option 2 : Backend Spring Boot + SendGrid**

**Pourquoi ?**
- Vous avez déjà un backend Spring Boot solide
- Vous aurez un contrôle total
- C'est cohérent avec votre architecture actuelle
- SendGrid offre 100 emails/jour gratuitement
- Vous pourrez réutiliser ce système pour d'autres emails (notifications, etc.)

**Pour tester rapidement :**
→ **Option 3** en attendant

---

## Configuration SendGrid (pour Options 1 & 2)

### Étape 1 : Créer un compte
1. [SendGrid](https://sendgrid.com) → Sign Up
2. Vérifiez votre email

### Étape 2 : Configurer l'authentification
1. Settings → Sender Authentication
2. **Authenticate Your Domain** (recommandé) OU **Single Sender Verification**

#### Avec domaine personnalisé (recommandé)
- Ajoutez vos enregistrements DNS (CNAME)
- Attendez la validation (quelques heures)
- SPF/DKIM configurés automatiquement
- Taux de délivrabilité maximal

#### Sans domaine (Single Sender)
- Vérifiez une adresse email
- Moins bon taux de délivrabilité
- Mais fonctionne immédiatement

### Étape 3 : Créer une API Key
1. Settings → API Keys → Create API Key
2. Nom : "Plan Appetit Production"
3. Permissions : Full Access
4. Copiez la clé (vous ne pourrez plus la voir)

### Étape 4 : Ajouter à votre .env
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Prochaines étapes

Quelle option préférez-vous ?
1. Je vous aide à configurer SendGrid + Backend Spring Boot (complet)
2. Je vous guide pour Firebase Extensions (plus simple)
3. On ajoute juste un message pour vérifier les spams (temporaire)
