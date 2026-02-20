# Titre du projet: BackOffice de Gestion des articles

## Description
Application full-stack de gestion éditoriale permettant de:
- gérer des articles (création, édition, publication, archivage),
- administrer catégories et réseaux,
- envoyer des notifications email,
- importer des articles depuis un fichier JSON,
- visualiser un dashboard de suivi.

Le projet est structuré en deux applications:
- `back/`: API REST Node.js + Express + Prisma,
- `front/`: interface React + Vite.

## Prérequis
- Node.js version 20 LTS (recommandé)
- npm (ou yarn, mais les commandes ci-dessous utilisent npm)

## Installation
```bash
# Depuis la racine du projet

# 1) Installer les dépendances backend
cd back
npm install

# 2) Installer les dépendances frontend
cd ../front
npm install

# 3) Configurer les variables d'environnement
# Backend
cd ../back
cp .env.example .env

# Frontend
cd ../front
cp .env.example .env

# 4) Générer le client Prisma et appliquer la migration locale
cd ../back
npm run prisma:generate
npm run prisma:migrate
```

## Lancement
```bash
# Terminal 1 - Backend
cd back
npm run dev

# Terminal 2 - Frontend
cd front
npm run dev
```

Par défaut:
- API: `http://localhost:5000`
- Front: `http://localhost:5173`

## Choix techniques
- Architecture choisie et pourquoi
  - Architecture séparée `front` / `back` pour découpler l'UI et l'API, faciliter les tests et le déploiement indépendant.
  - Backend organisé en couches `routes -> controllers -> services -> Prisma` pour isoler les responsabilités.
  - Frontend organisé par pages/modules pour garder une navigation claire (dashboard, articles, catégories, notifications, import).
- Technologies utilisées et justification
  - `Express` (API REST simple et rapide à mettre en place).
  - `Prisma + SQLite` (modélisation claire des données, setup local rapide pour démonstration).
  - `React + Vite + TypeScript` (DX rapide, typage fort, build moderne).
  - `Zod` (validation d'entrées côté front et back).
  - `Nodemailer` (notifications email).
  - `Jest` (tests unitaires backend sur la couche service).
- Compromis effectués (si limites de temps)
  - Authentification/autorisation implémentée côté API mais pas intégrée dans un vrai parcours UX côté frontend (pas d'écran de login dédié).
  - Protection des routes API non homogène (certaines routes restent accessibles sans middleware d'auth).
  - Couverture de tests concentrée sur quelques services backend, sans E2E front/back.

## Fonctionnalités implémentées
- Dashboard (stats articles/réseaux/catégories + notifications récentes): **complet**
- Gestion des articles (CRUD, filtres, tri, pagination, actions en masse): **complet**
- Gestion des catégories: **complet**
- Gestion des réseaux: **complet**
- Import JSON d'articles: **complet**
- Notifications email (envoi + historique): **complet**
- Authentification JWT (register/login/profile côté API): **partiel**
- Accès personnalisé selon le rôle utilisateur (ADMIN/EDITOR): **partiel**
- Parcours d'authentification complet côté interface (login/logout/guard de routes): **non fait**
- Tests E2E (front + back): **non fait**

## Ce qui aurait été fait avec plus de temps
- 1. Authentification complète côté front (écran login, refresh token, logout, guards de routes).
- 2. Accès personnalisé selon le rôle utilisateur sur toutes les routes API + gestion des permissions dans l'UI.
- 3. Sécurisation homogène de toutes les routes sensibles (catégories, réseaux, import, statut, notifications).
- 4. Tests E2E (Playwright/Cypress) couvrant les parcours critiques.
- 5. CI/CD (lint, tests, build automatiques sur pull request).
- 6. Observabilité (logs structurés, métriques, suivi d'erreurs).

## Tests
Tests backend disponibles (Jest):
```bash
cd back
npm test
```

Fichiers de test présents notamment sur:
- services articles
- services catégories
- services notifications

## Difficultés rencontrées
- Encodage/accents (UTF-8) observé dans certains fichiers TypeScript, pouvant dégrader l'affichage des labels/messages.
  - Solution: standardiser l'encodage UTF-8 et uniformiser l'édition des fichiers.
- Mise en place d'une sécurité homogène sur toutes les routes API.
  - Solution partielle actuelle: middleware présent et utilisé sur certaines routes; durcissement global à finaliser.
