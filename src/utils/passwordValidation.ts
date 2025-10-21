export interface PasswordStrength {
    isValid: boolean;
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
    return {
        isValid: password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasMinLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
};

export const getPasswordStrengthText = (strength: PasswordStrength): { text: string; color: string } => {
    const validCount = [
        strength.hasMinLength,
        strength.hasUpperCase,
        strength.hasLowerCase,
        strength.hasNumber,
        strength.hasSpecialChar,
    ].filter(Boolean).length;

    if (validCount === 5) {
        return { text: 'Fort', color: 'text-green-600' };
    } else if (validCount >= 3) {
        return { text: 'Moyen', color: 'text-orange-600' };
    } else {
        return { text: 'Faible', color: 'text-red-600' };
    }
};
