# Titre du projet: BackOffice de Gestion des articles

## Description
Application full-stack de gestion Ã©ditoriale permettant de:
- gÃ©rer des articles (crÃ©ation, Ã©dition, publication, archivage),
- administrer catÃ©gories et rÃ©seaux,
- envoyer des notifications email,
- importer des articles depuis un fichier JSON,
- visualiser un dashboard de suivi.

Le projet est structurÃ© en deux applications:
- `back/`: API REST Node.js + Express + Prisma,
- `back-django/`: API REST Django + Django REST Framework,
- `front/`: interface React + Vite.

## PrÃ©requis
- Node.js version 20 LTS (recommandÃ©)
- npm (ou yarn, mais les commandes ci-dessous utilisent npm)

## Installation
```bash
# Depuis la racine du projet

# 1) Installer les dÃ©pendances backend
cd back
npm install

# 2) Installer les dÃ©pendances frontend
cd ../front
npm install

# 3) Configurer les variables d'environnement
# Backend
cd ../back
cp .env.example .env

# Frontend
cd ../front
cp .env.example .env

# 4) GÃ©nÃ©rer le client Prisma et appliquer la migration locale
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

Par dÃ©faut:
- API: `http://localhost:5000`
- Front: `http://localhost:5173`

## DonnÃ©es de dÃ©monstration
- Fichier d'import JSON (8 articles exemples): `back/sample-articles.json`
- CatÃ©gories et rÃ©seaux prÃ©-configurÃ©s via le seed backend au dÃ©marrage:
  - CatÃ©gories: `Technology`, `Business`, `Lifestyle`
  - RÃ©seaux: `Tech Enthusiasts`, `Business Leaders`
- Historique de notifications prÃ©-rempli: 3 notifications d'exemple crÃ©Ã©es au seed.

## Choix techniques
- Architecture choisie et pourquoi
  - Architecture sÃ©parÃ©e `front` / `back` pour dÃ©coupler l'UI et l'API, faciliter les tests et le dÃ©ploiement indÃ©pendant.
  - Backend organisÃ© en couches `routes -> controllers -> services -> Prisma` pour isoler les responsabilitÃ©s.
  - Frontend organisÃ© par pages/modules pour garder une navigation claire (dashboard, articles, catÃ©gories, notifications, import).
- Technologies utilisÃ©es et justification
  - `Express` (API REST simple et rapide Ã  mettre en place).
  - `Prisma + SQLite` (modÃ©lisation claire des donnÃ©es, setup local rapide pour dÃ©monstration).
  - `React + Vite + TypeScript` (DX rapide, typage fort, build moderne).
  - `Zod` (validation d'entrÃ©es cÃ´tÃ© front et back).
  - `Nodemailer` (notifications email).
  - `Jest` (tests unitaires backend sur la couche service).
- Compromis effectuÃ©s (si limites de temps)
  - Authentification/autorisation implÃ©mentÃ©e cÃ´tÃ© API mais pas intÃ©grÃ©e dans un vrai parcours UX cÃ´tÃ© frontend (pas d'Ã©cran de login dÃ©diÃ©).
  - Protection des routes API non homogÃ¨ne (certaines routes restent accessibles sans middleware d'auth).
  - Couverture de tests concentrÃ©e sur quelques services backend, sans E2E front/back.

## FonctionnalitÃ©s implÃ©mentÃ©es
- Dashboard (stats articles/rÃ©seaux/catÃ©gories + notifications rÃ©centes): **complet**
- Gestion des articles (CRUD, filtres, tri, pagination, actions en masse): **complet**
- Gestion des catÃ©gories: **complet**
- Gestion des rÃ©seaux: **complet**
- Import JSON d'articles: **complet**
- Notifications email (envoi + historique): **complet**
- Authentification JWT (register/login/profile cÃ´tÃ© API): **partiel**
- AccÃ¨s personnalisÃ© selon le rÃ´le utilisateur (ADMIN/EDITOR): **partiel**
- Parcours d'authentification complet cÃ´tÃ© interface (login/logout/guard de routes): **non fait**
- Tests E2E (front + back): **non fait**

## Ce qui aurait Ã©tÃ© fait avec plus de temps
- 1. Authentification complÃ¨te cÃ´tÃ© front (Ã©cran login, refresh token, logout, guards de routes).
- 2. AccÃ¨s personnalisÃ© selon le rÃ´le utilisateur sur toutes les routes API + gestion des permissions dans l'UI.
- 3. SÃ©curisation homogÃ¨ne de toutes les routes sensibles (catÃ©gories, rÃ©seaux, import, statut, notifications).
- 4. Tests E2E (Playwright/Cypress) couvrant les parcours critiques.
- 5. CI/CD (lint, tests, build automatiques sur pull request).
- 6. ObservabilitÃ© (logs structurÃ©s, mÃ©triques, suivi d'erreurs).

## Tests
Tests backend disponibles (Jest):
```bash
cd back
npm test
```

Fichiers de test prÃ©sents notamment sur:
- services articles
- services catÃ©gories
- services notifications

## DifficultÃ©s rencontrÃ©es
- Encodage/accents (UTF-8) observÃ© dans certains fichiers TypeScript, pouvant dÃ©grader l'affichage des labels/messages.
  - Solution: standardiser l'encodage UTF-8 et uniformiser l'Ã©dition des fichiers.
- Mise en place d'une sÃ©curitÃ© homogÃ¨ne sur toutes les routes API.
  - Solution partielle actuelle: middleware prÃ©sent et utilisÃ© sur certaines routes; durcissement global Ã  finaliser.


## Variante Django
Un backend Django parallele a ete ajoute dans `back-django/` pour repartir sur une architecture similaire au backend Node existant, avec JWT, SQLite, CRUD articles/categories/reseaux, notifications et import JSON.


