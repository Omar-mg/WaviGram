# WaviGram

> **Where Conversations Meet Community.**

A next-generation social networking platform that brings together the strongest features of WhatsApp, Instagram, Telegram, Discord, and more — into a clean, fast, premium experience.

## ✨ Vision

WaviGram is not a clone. It is the **anti-clutter social network** — inspired by the best parts of existing platforms while introducing a smarter, more elegant experience.

## 🏗️ Architecture

This is a **pnpm monorepo** with the following structure:

```
WaviGram/
├── apps/
│   ├── web/         # React 18 + Vite + TypeScript frontend  (Phase 1 ✅)
│   └── api/         # Node.js + Express + Socket.IO backend (Phase 2)
└── packages/
    ├── shared/      # Cross-app types, constants, validators
    └── ui/          # (placeholder)
```

## 🛠️ Tech Stack

**Frontend (`apps/web`):**
- React 18 + TypeScript (strict)
- Vite 5 (build tool, HMR)
- Tailwind CSS 3 (styling, custom WaviGram design tokens)
- Framer Motion 11 (animations)
- React Router 6 (client-side routing)
- TanStack Query 5 (server state)
- Zustand 4 (client UI state)
- React Hook Form 7 + Zod 3 (forms + validation)
- Lucide React (icons)
- Socket.IO Client (real-time, stubbed for now)

**Backend (`apps/api` — Phase 2):**
- Node.js + Express + TypeScript
- TypeORM + PostgreSQL
- Redis (cache, pub/sub, presence)
- Socket.IO (real-time)
- JWT (auth)

**DevOps:**
- Docker + Docker Compose
- GitHub Actions CI
- pnpm workspaces

## 📋 Prerequisites

- **Node.js 20+** (we tested on 24)
- **pnpm 9+** (`npm install -g pnpm`)
- **Docker Desktop** (for Postgres/Redis/services, optional for Phase 1)

## 🚀 Quick Start

```bash
# Install all workspace dependencies
pnpm install

# Run the frontend dev server
pnpm dev
# → http://localhost:5173
```

Other useful scripts:

```bash
pnpm typecheck     # TypeScript strict check
pnpm lint          # ESLint
pnpm build         # Production build
pnpm format        # Prettier
```

## 🎨 Design Philosophy

- **Dark mode first** — premium dark UI is the default
- **Mobile-first** — designed for small screens, scaled up
- **Clean, minimal, premium** — every element earns its place
- **Smooth animations** — Framer Motion, iOS-like easing
- **Accessible** — keyboard nav, ARIA, contrast
- **Fast** — code-split routes, optimized images, no bloat

The WaviGram design tokens live in `apps/web/tailwind.config.ts`.

## 📍 Roadmap

- [x] **Phase 1 — Foundation** (current): monorepo, frontend skeleton, design system, layout, page stubs
- [ ] **Phase 2 — Backend**: Express + TypeORM + Postgres + Redis + Socket.IO, real auth
- [ ] **Phase 3 — Social graph**: profiles, follow, friends, blocking
- [ ] **Phase 4 — Messaging**: real-time chat, media, voice/video calls
- [ ] **Phase 5 — Feed & Stories**: posts, stories, recommendations
- [ ] **Phase 6 — AI features**: smart reply, moderation, recommendations
- [ ] **Phase 7 — Marketplace & Business tools**
- [ ] **Phase 8 — Mobile (React Native)**
- [ ] **Phase 9 — Scale & Infrastructure (K8s, monitoring)**

## 📄 Project Documents

- `WaviGram ChatGpt.txt` — the master project brief

## 📜 License

Proprietary — © WaviGram. All rights reserved.
