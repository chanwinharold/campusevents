# CampusEvents 🎪

Application web de gestion d'événements avec génération automatique de QR codes.

**Parcours utilisateur :**

- **Admin** : Crée un événement → QR code généré automatiquement → Partage/imprime le QR code
- **Visiteur** : Scanne le QR code → Voit le flyer → Télécharge le flyer

## Stack Technique

| Technologie                   | Usage                  |
| ----------------------------- | ---------------------- |
| **Next.js 15.5** (App Router) | Framework fullstack    |
| **TypeScript**                | Typage strict          |
| **Tailwind CSS v3**           | Styles                 |
| **shadcn/ui**                 | Composants UI          |
| **Prisma**                    | ORM base de données    |
| **PostgreSQL (Neon)**         | Base de données        |
| **NextAuth v5** (Auth.js)     | Authentification admin |
| **Vercel Blob**               | Stockage des flyers    |
| **qrcode**                    | Génération QR codes    |
| **Zod**                       | Validation formulaires |
| **Lucide React**              | Icônes                 |

## Structure du Projet

```
src/
├── actions/          # Server Actions
│   └── events.ts     # CRUD événements + tracking
├── app/
│   ├── (admin)/      # Route group admin
│   │   └── admin/
│   │       ├── dashboard/   # Dashboard statistiques
│   │       ├── events/      # Gestion événements
│   │       │   ├── new/     # Création
│   │       │   └── [id]/edit/ # Modification
│   │       ├── login/       # Connexion
│   │       ├── settings/    # Paramètres
│   │       └── layout.tsx   # Sidebar + navigation
│   ├── (public)/    # Route group public
│   │   └── event/[slug]/    # Page publique événement
│   ├── api/
│   │   ├── auth/[...nextauth] # NextAuth route
│   │   └── upload/          # Upload flyer
│   ├── page.tsx      # Landing page
│   └── layout.tsx    # Layout racine
├── components/       # Composants réutilisables
├── lib/
│   ├── auth.ts       # Configuration NextAuth
│   ├── db.ts         # Client Prisma singleton
│   └── validations.ts # Schémas Zod
└── types/            # Types TypeScript
```

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL (via Neon ou local)
- Compte Vercel (pour déploiement)

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd campusevents
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Configurer :

```env
# Base de données PostgreSQL (Neon recommandé)
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Clé secrète NextAuth (générer avec: openssl rand -base64 32)
AUTH_SECRET="votre-clé-secrète"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin par défaut (seed)
ADMIN_EMAIL="admin@campusevents.com"
ADMIN_PASSWORD="changez-moi"
```

### 4. Base de données

```bash
# Appliquer le schéma
npx prisma db push

# Créer le compte admin
npm run db:seed
```

### 5. Lancer en développement

```bash
npm run dev
```

Accès :

- **Landing page** : http://localhost:3000
- **Admin login** : http://localhost:3000/admin/login
- **Admin dashboard** : http://localhost:3000/admin/dashboard

## Déploiement sur Vercel

### 1. Préparer

```bash
# Installer Vercel CLI
npm i -g vercel

# Connecter à Vercel
vercel login
```

### 2. Base de données

Créer une base PostgreSQL sur [Neon](https://neon.tech) ou [Supabase](https://supabase.com).

### 3. Stockage flyers

Créer un [Vercel Blob Store](https://vercel.com/docs/storage/vercel-blob) et récupérer le token.

### 4. Déployer

```bash
vercel
```

Variables d'environnement à configurer dans Vercel :

| Variable                | Description                 |
| ----------------------- | --------------------------- |
| `DATABASE_URL`          | URL de connexion PostgreSQL |
| `AUTH_SECRET`           | Clé secrète NextAuth        |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob           |
| `NEXT_PUBLIC_APP_URL`   | URL du déploiement          |

### 5. Seed la base

```bash
# Lancer le seed en production
vercel run db:seed
```

## Fonctionnalités

### Admin

- [x] Authentification sécurisée (email/mot de passe)
- [x] Dashboard avec statistiques
- [x] CRUD complet des événements
- [x] Upload flyer avec drag-and-drop
- [x] Génération automatique QR code
- [x] Téléchargement QR code
- [x] Copie lien public

### Public

- [x] Page événement optimisée mobile
- [x] Affichage flyer en grand
- [x] Bouton téléchargement flyer
- [x] Bouton partage (Web Share API)
- [x] Tracking scans et téléchargements
- [x] SEO et Open Graph

## Scripts

```bash
npm run dev          # Développement
npm run build        # Production build
npm start           # Démarrer production
npm run db:push     # Push schema Prisma
npm run db:seed     # Seed admin
npm run db:studio   # Prisma Studio
npm run lint        # ESLint
npm run format      # Prettier
```

## API Routes

| Route         | Méthode | Description               |
| ------------- | ------- | ------------------------- |
| `/api/auth/*` | POST    | Authentification NextAuth |
| `/api/upload` | POST    | Upload flyer (max 10 MB)  |

## Licence

MIT
