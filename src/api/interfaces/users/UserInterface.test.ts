import { describe, it, expect } from 'vitest';
import { UserRole, USER_ROLE_LEVELS, hasRoleLevel, isPremiumUser } from './UserInterface';

describe('UserRole', () => {
    describe('USER_ROLE_LEVELS', () => {
        it('devrait avoir le niveau 0 pour MEMBER', () => {
            expect(USER_ROLE_LEVELS[UserRole.MEMBER]).toBe(0);
        });

        it('devrait avoir le niveau 1 pour BETA_USER', () => {
            expect(USER_ROLE_LEVELS[UserRole.BETA_USER]).toBe(1);
        });

        it('devrait avoir le niveau 2 pour PREMIUM', () => {
            expect(USER_ROLE_LEVELS[UserRole.PREMIUM]).toBe(2);
        });

        it('devrait avoir le niveau 2 pour PREMIUM_FOR_EVER (même niveau que PREMIUM)', () => {
            expect(USER_ROLE_LEVELS[UserRole.PREMIUM_FOR_EVER]).toBe(2);
        });

        it('devrait avoir le niveau 3 pour ADMIN', () => {
            expect(USER_ROLE_LEVELS[UserRole.ADMIN]).toBe(3);
        });
    });

    describe('hasRoleLevel', () => {
        it('devrait retourner true si le rôle utilisateur est supérieur au rôle requis', () => {
            expect(hasRoleLevel(UserRole.PREMIUM, UserRole.MEMBER)).toBe(true);
            expect(hasRoleLevel(UserRole.ADMIN, UserRole.PREMIUM)).toBe(true);
        });

        it('devrait retourner true si le rôle utilisateur est égal au rôle requis', () => {
            expect(hasRoleLevel(UserRole.MEMBER, UserRole.MEMBER)).toBe(true);
            expect(hasRoleLevel(UserRole.PREMIUM, UserRole.PREMIUM)).toBe(true);
        });

        it('devrait retourner false si le rôle utilisateur est inférieur au rôle requis', () => {
            expect(hasRoleLevel(UserRole.MEMBER, UserRole.PREMIUM)).toBe(false);
            expect(hasRoleLevel(UserRole.BETA_USER, UserRole.ADMIN)).toBe(false);
        });

        it('devrait considérer PREMIUM et PREMIUM_FOR_EVER comme équivalents', () => {
            expect(hasRoleLevel(UserRole.PREMIUM, UserRole.PREMIUM_FOR_EVER)).toBe(true);
            expect(hasRoleLevel(UserRole.PREMIUM_FOR_EVER, UserRole.PREMIUM)).toBe(true);
        });
    });

    describe('isPremiumUser', () => {
        it('devrait retourner false pour MEMBER', () => {
            expect(isPremiumUser(UserRole.MEMBER)).toBe(false);
        });

        it('devrait retourner false pour BETA_USER', () => {
            expect(isPremiumUser(UserRole.BETA_USER)).toBe(false);
        });

        it('devrait retourner true pour PREMIUM', () => {
            expect(isPremiumUser(UserRole.PREMIUM)).toBe(true);
        });

        it('devrait retourner true pour PREMIUM_FOR_EVER', () => {
            expect(isPremiumUser(UserRole.PREMIUM_FOR_EVER)).toBe(true);
        });

        it('devrait retourner true pour ADMIN', () => {
            expect(isPremiumUser(UserRole.ADMIN)).toBe(true);
        });
    });
});
