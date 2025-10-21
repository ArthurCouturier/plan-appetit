export const translateFirebaseError = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'L\'adresse email est invalide.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/user-not-found': 'Aucun compte ne correspond à cet email.',
        'auth/wrong-password': 'Le mot de passe est incorrect.',
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
        'auth/weak-password': 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.',
        'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée.',
        'auth/invalid-credential': 'Les identifiants fournis sont invalides.',
        'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cette adresse email mais avec un autre mode de connexion.',
        'auth/requires-recent-login': 'Cette opération est sensible et nécessite une authentification récente. Veuillez vous reconnecter.',
        'auth/network-request-failed': 'Erreur de connexion réseau. Veuillez vérifier votre connexion internet.',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'auth/popup-blocked': 'La popup a été bloquée par le navigateur. Veuillez autoriser les popups pour ce site.',
        'auth/popup-closed-by-user': 'La popup a été fermée avant la fin de l\'authentification.',
        'auth/unauthorized-domain': 'Ce domaine n\'est pas autorisé pour cette application.',
        'auth/invalid-action-code': 'Le code d\'action est invalide ou a expiré.',
        'auth/expired-action-code': 'Le code d\'action a expiré.',
        'auth/invalid-verification-code': 'Le code de vérification est invalide.',
        'auth/invalid-verification-id': 'L\'ID de vérification est invalide.',
        'auth/missing-verification-code': 'Le code de vérification est manquant.',
        'auth/missing-verification-id': 'L\'ID de vérification est manquant.',
        'auth/credential-already-in-use': 'Ces identifiants sont déjà associés à un autre compte.',
        'auth/timeout': 'L\'opération a expiré. Veuillez réessayer.',
        'auth/missing-android-pkg-name': 'Un nom de package Android doit être fourni.',
        'auth/missing-continue-uri': 'Une URL de continuation doit être fournie.',
        'auth/missing-ios-bundle-id': 'Un identifiant de bundle iOS doit être fourni.',
        'auth/invalid-continue-uri': 'L\'URL de continuation fournie est invalide.',
        'auth/unauthorized-continue-uri': 'Le domaine de l\'URL de continuation n\'est pas autorisé.',
    };

    return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};

export const getFirebaseErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const firebaseErrorMatch = error.message.match(/\(([^)]+)\)/);
        if (firebaseErrorMatch && firebaseErrorMatch[1]) {
            return translateFirebaseError(firebaseErrorMatch[1]);
        }
        return error.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
};
