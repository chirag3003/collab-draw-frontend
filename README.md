# Collab Draw 🎨

A high-performance, real-time collaborative whiteboarding application built with **Next.js 15**, **Go**, and **Excalidraw**.

## 🚀 Overview

`collab-draw` allows teams to create, organize, and collaborate on diagrams and wireframes in real-time. It features a robust synchronization engine that handles concurrent edits smoothly using a custom merging strategy.

## ✨ Features

- **Real-time Collaboration** - Multiple users drawing simultaneously with live sync.
- **Smart Conflict Resolution** - Intelligent 3-way merge prevents data loss during concurrent edits.
- **Workspace Management** - Organize projects into personal and team-shared workspaces.
- **Auto-save** - Changes are saved automatically with optimized throttling (100ms).
- **Modern UI** - Built with Tailwind CSS 4, Radix UI, and Framer Motion.
- **Authentication** - Secure user management powered by Clerk.

## 🏗️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - App Router & Turbopack.
- **[React 19](https://react.dev/)** - Latest UI features.
- **[Excalidraw SDK](https://excalidraw.com/)** - Core drawing engine.
- **[Apollo Client](https://www.apollographql.com/)** - GraphQL state management & Subscriptions.
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling.
- **[Clerk](https://clerk.com/)** - Authentication.

### Backend (See [Backend README](../collab-draw-backend/README.md))
- **Go** - High-performance GraphQL server.
- **MongoDB** - Document storage for drawing elements.
- **WebSockets** - Real-time updates via GraphQL subscriptions.

## 🤝 How Collaboration Works

The core collaboration engine is optimized for performance and reliability:

1. **Throttled Updates (100ms)**: Batches changes to send at most 10 updates per second, reducing network overhead by ~90%.
2. **Fast Hash-Based Comparison**: Uses a quick element-version hashing function to detect changes without expensive JSON serialization.
3. **Smart 3-Way Merge**:
   - Tracks: `current state`, `incoming state`, and `last synced state`.
   - Uses a **Last-Write-Wins (LWW)** versioning strategy.
   - Preserves local uncommitted changes when remote updates arrive.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ or [Bun](https://bun.sh/)
- A running instance of the [Backend](../collab-draw-backend)

### Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/query
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8080/query
```

### Installation
```bash
bun install
bun dev
```

## 📂 Project Structure

- `app/`: Next.js routes (Dashboard, Project Canvas).
- `components/projects/`: Core drawing logic (`Project.tsx`).
- `components/app/`: Workspace/Project management UI.
- `lib/hooks/`: GraphQL interaction hooks for Projects and Workspaces.
- `lib/apolloClient.ts`: Apollo Client configuration.

## 🧹 Quality Assurance

We use [Biome](https://biomejs.dev/) for ultra-fast linting and formatting:
```bash
bun lint   # Run linter
bun format # Auto-format code
```

