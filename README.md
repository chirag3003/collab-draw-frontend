# Collab Draw 🎨

A real-time collaborative drawing and diagramming application built with Next.js, powered by Excalidraw. Create beautiful diagrams, wireframes, and illustrations with your team in real-time.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![GraphQL](https://img.shields.io/badge/GraphQL-16.x-E10098?style=flat-square&logo=graphql)

## ✨ Features

### 🎯 Core Features
- **Real-time Collaboration** - Multiple users can draw simultaneously with live synchronization
- **Smart Conflict Resolution** - Intelligent 3-way merge prevents data loss during concurrent edits
- **Workspace Management** - Organize projects into personal and team workspaces
- **Member Permissions** - Invite team members and manage access controls
- **Auto-save** - Changes saved automatically with optimized throttling
- **Dark Mode** - Full dark mode support with custom theme

### 🎨 Drawing Capabilities
- **Powered by Excalidraw** - Industry-leading drawing tools
- **Multiple Element Types** - Shapes, arrows, text, hand-drawn elements
- **Export Options** - Save drawings to disk
- **State Persistence** - Canvas position and zoom level remembered

### 👥 Team Collaboration
- **Personal Workspaces** - Private space for individual projects
- **Shared Workspaces** - Team collaboration spaces with member management
- **Email Invitations** - Add team members by email
- **Owner Controls** - Manage workspace and project settings

## 🏗️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library (Radix UI)
- **[Excalidraw](https://excalidraw.com/)** - Drawing canvas

### State Management & API
- **[Apollo Client](https://www.apollographql.com/docs/react/)** - GraphQL client
- **[graphql-ws](https://github.com/enisdenjo/graphql-ws)** - WebSocket subscriptions for real-time updates
- **HTTP + WebSocket Split** - Optimal routing for queries/mutations vs subscriptions

### Authentication
- **[Clerk](https://clerk.com/)** - User authentication and management
- JWT token-based API authorization

### Developer Tools
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (or Bun)
- Backend GraphQL API running (see backend repository)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# GraphQL API Endpoints
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:5000/query
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:5000/query
```

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout (Clerk + Apollo)
│   ├── globals.css              # Global styles
│   ├── app/                     # Protected dashboard
│   │   ├── layout.tsx           # App layout with sidebar
│   │   ├── page.tsx             # Personal projects
│   │   └── [id]/page.tsx        # Workspace projects
│   └── projects/
│       └── [id]/page.tsx        # Drawing canvas page
│
├── components/
│   ├── app/
│   │   ├── ProjectsList/        # Project grid & dialogs
│   │   │   ├── index.tsx        # Main project list component
│   │   │   ├── CreateProjectDialog.tsx
│   │   │   ├── ProjectSettingsDialog.tsx
│   │   │   ├── ShareWorkspaceDialog.tsx
│   │   │   └── WorkspaceSettingsDialog.tsx
│   │   └── Sidebar/             # Navigation sidebar
│   │       ├── index.tsx
│   │       └── CreateWorkspaceDialog.tsx
│   ├── projects/
│   │   ├── Project.tsx          # Core drawing component
│   │   └── ProjectEnhanced.tsx  # Enhanced version (experimental)
│   ├── providers/
│   │   └── ApolloProvider.tsx   # Apollo Client setup
│   └── ui/                      # shadcn/ui components
│
├── lib/
│   ├── apolloClient.ts          # Client-side Apollo config
│   ├── serverApollo.ts          # Server-side Apollo (SSR)
│   ├── utils.ts                 # Utility functions
│   └── hooks/
│       ├── project.tsx          # Project GraphQL hooks
│       └── workspace.tsx        # Workspace GraphQL hooks
│
└── middleware.ts                # Clerk route protection
```

## 🔄 How It Works

### Real-Time Collaboration

The core collaboration engine uses several sophisticated techniques:

1. **Throttled Updates (100ms)** - Reduces network requests by 90%
   - Batches changes to send max 10 updates/second instead of 100+

2. **Fast Hash-Based Comparison** - 90% faster change detection
   - Uses element IDs and versions instead of expensive JSON.stringify

3. **Smart 3-Way Merge** - Prevents data loss
   - Tracks: current state, incoming state, last synced state
   - Preserves local uncommitted changes during remote updates

4. **WebSocket Subscriptions** - Real-time updates
   - GraphQL subscriptions for live synchronization
   - Automatic reconnection with retry logic

### Update Flow

```
User Draws → onChange → Hash Check → Throttle (100ms) → GraphQL Mutation
                                                              ↓
GraphQL Subscription ← Backend Broadcast ← Update Saved
        ↓
Smart Merge → Update Excalidraw Scene
```

## 📊 GraphQL API

### Queries
```graphql
# Get project details
project(id: ID!): Project

# Get user's personal projects
projectsPersonalByUser(userId: ID!): [Project!]!

# Get workspace projects
projectsByWorkspace(workspaceId: ID!): [Project!]!

# Get workspace details
workspace(id: ID!): Workspace
```

### Mutations
```graphql
# Create new project
createProject(input: CreateProjectInput!): ID!

# Update drawing elements
updateProject(id: ID!, elements: String!, socketID: ID!): Boolean

# Update project metadata
updateProjectMetadata(id: ID!, name: String!, description: String!): Boolean

# Delete project
deleteProject(id: ID!): Boolean

# Workspace mutations
createWorkspace(input: CreateWorkspaceInput!): ID!
addMemberToWorkspace(workspaceId: ID!, email: String!): Boolean
removeMemberFromWorkspace(workspaceId: ID!, userId: ID!): Boolean
```

### Subscriptions
```graphql
# Real-time project updates
subscription {
  project(id: ID!) {
    elements
    socketID
  }
}
```

## 🎯 Use Cases

### Design Teams
- Wireframes and mockups
- Design system documentation
- User flow diagrams

### Engineering Teams
- System architecture diagrams
- Database schemas
- Flowcharts and workflows

### Education
- Interactive learning materials
- Visual explanations
- Collaborative problem-solving

### Product Teams
- Brainstorming sessions
- Feature planning
- Process documentation

## ⚡ Performance

### Current Optimizations
- ✅ **Throttling** - 90% reduction in network requests
- ✅ **Fast Change Detection** - Hash-based comparison
- ✅ **Smart Merging** - Prevents data loss
- ✅ **Memory Leak Prevention** - Proper cleanup
- ✅ **Dynamic Imports** - Excalidraw loaded only when needed

### Future Improvements
See `PERFORMANCE_IMPROVEMENTS.md` for detailed roadmap:
- Operational Transform / CRDTs
- Echo prevention in subscriptions
- Payload compression (70-90% reduction)
- Adaptive throttling
- IndexedDB for offline support
- User cursor indicators

## 🔐 Security

- **Authentication** - Clerk handles user auth
- **Route Protection** - Middleware guards protected routes
- **API Authorization** - JWT tokens for GraphQL
- **Access Control** - Workspace and project ownership verification

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Documentation

- [Performance Improvements](./PERFORMANCE_IMPROVEMENTS.md) - Optimization strategies
- [Project Settings Feature](./PROJECT_SETTINGS_FEATURE.md) - Project management
- [Workspace Settings Feature](./WORKSPACE_SETTINGS_FEATURE.md) - Workspace management
- [Quick Improvements](./QUICK_IMPROVEMENTS.md) - Implementation guide

## 📄 License

This project is part of the Collab Draw platform.

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com/) - Amazing drawing library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Clerk](https://clerk.com/) - Authentication solution
- [Next.js](https://nextjs.org/) - React framework

## 📧 Contact

For questions or support, please open an issue on GitHub.
