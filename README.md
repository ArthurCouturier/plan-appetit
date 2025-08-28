# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
# boilerplate

# Env var 

VITE_OPENAI_API_KEY : clé secrète? pour interagir avec l'API d'OpenAI
VITE_FIREBASE_API_KEY : clé publique pour interagir avec l'API Firebase
VITE_FIREBASE_AUTH_DOMAIN : domaine sur lequel Firebase gère les flux d’authentification
VITE_FIREBASE_PROJECT_ID : identifiant unique du projet Firebase dans Google Cloud
VITE_FIREBASE_STORAGE_BUCKET : identifiant du bucket de stockage Firebase (où sont conservés les  fichiers comme images, PDF, etc)
VITE_FIREBASE_MESSAGING_SENDER_ID : identifiant de l’expéditeur pour Firebase Cloud Messaging
VITE_FIREBASE_APP_ID : identifiant unique de l’application dans Firebase, lié au projet
VITE_FIREBASE_MEASUREMENT_ID : identifiant utilisé par Google Analytics pour suivre l’usage de l’app
VITE_API_URL : url du backend
VITE_API_PORT : port du backend
PUBLIC_KEY : clé publique stripe permettant d'authentifier son compte et d'utiliser l'API Stripe
