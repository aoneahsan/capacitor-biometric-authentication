# CLAUDE.md

**Last Updated:** 2025-12-07

## Project Overview

This is a monorepo containing biometric authentication packages (frontend + backend) and their test applications.

### Project Structure

| Folder | Type | Description |
|--------|------|-------------|
| `capacitor-biometric-authentication/` | **Package (Frontend)** | React + Capacitor plugin for biometric auth (Android, iOS, Web) |
| `webauthn-server-buildkit/` | **Package (Backend)** | Node.js + TypeScript WebAuthn server implementation |
| `frontend-test-app/` | Test App | React + Capacitor app to test frontend package |
| `backend-test-app/` | Test App | Node.js backend to test server package |

### Package Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│                         PACKAGES                                 │
├─────────────────────────────────┬───────────────────────────────┤
│  capacitor-biometric-auth       │  webauthn-server-buildkit     │
│  (Frontend Package)             │  (Backend Package)            │
│  - React/Vue/Angular/Vanilla    │  - Express/Fastify/Koa/etc    │
│  - Capacitor 7+                 │  - Node.js 20+                │
│  - WebAuthn client API          │  - WebAuthn server API        │
└─────────────────────────────────┴───────────────────────────────┘
                    ▲                           ▲
                    │ Used by                   │ Used by
                    │                           │
┌─────────────────────────────────┬───────────────────────────────┐
│                       TEST APPS                                  │
├─────────────────────────────────┼───────────────────────────────┤
│  frontend-test-app              │  backend-test-app             │
│  (Test Frontend Package)        │  (Test Backend Package)       │
└─────────────────────────────────┴───────────────────────────────┘
```

## Commands

### Root Level
```bash
# No root package.json - work in individual project folders
cd capacitor-biometric-authentication && yarn install
cd webauthn-server-buildkit && yarn install
cd frontend-test-app && yarn install
cd backend-test-app && yarn install
```

### Frontend Package (capacitor-biometric-authentication)
```bash
cd capacitor-biometric-authentication
yarn build              # Build plugin
yarn watch              # Watch mode
yarn lint               # Lint code
yarn prettier           # Format code
```

### Backend Package (webauthn-server-buildkit)
```bash
cd webauthn-server-buildkit
yarn build              # Build with tsup
yarn dev                # Watch mode
yarn test               # Run tests (vitest)
yarn test:watch         # Watch tests
yarn lint               # Lint code
yarn format             # Format with prettier
yarn typecheck          # TypeScript check
```

### Frontend Test App (frontend-test-app)
```bash
cd frontend-test-app
yarn dev                # Vite dev server
yarn build              # Production build
yarn cap:sync           # Sync Capacitor
```

### Backend Test App (backend-test-app)
```bash
cd backend-test-app
yarn dev                # Dev server
yarn start              # Production
```

## ⚠️ CRITICAL: Yarn Link Setup (Local Development)

All packages are linked via `yarn link` for instant testing without publishing.

### Current Link Status

| Package | Linked To | Command to Rebuild |
|---------|-----------|-------------------|
| `webauthn-server-buildkit` | `backend-test-app` | `cd webauthn-server-buildkit && yarn build` |
| `capacitor-biometric-authentication` | `frontend-test-app` | `cd capacitor-biometric-authentication && yarn build` |

### MANDATORY RULE

**After making ANY changes to a package, you MUST rebuild it:**

```bash
# After changes to webauthn-server-buildkit:
cd webauthn-server-buildkit && yarn build

# After changes to capacitor-biometric-authentication:
cd capacitor-biometric-authentication && yarn build
```

### Re-establishing Links (if needed)

If links break (e.g., after `yarn install`), re-establish them:

```bash
# Step 1: Register packages
cd webauthn-server-buildkit && yarn link
cd capacitor-biometric-authentication && yarn link

# Step 2: Link in test apps
cd backend-test-app && yarn link "webauthn-server-buildkit"
cd frontend-test-app && yarn link "capacitor-biometric-authentication"
```

## Development Workflow

### Working on Frontend Package
1. Make changes in `capacitor-biometric-authentication/src/`
2. **Build**: `cd capacitor-biometric-authentication && yarn build`
3. Changes are instantly available in `frontend-test-app` via yarn link
4. Test: `cd frontend-test-app && yarn dev`

### Working on Backend Package
1. Make changes in `webauthn-server-buildkit/src/`
2. **Build**: `cd webauthn-server-buildkit && yarn build`
3. Changes are instantly available in `backend-test-app` via yarn link
4. Test: `cd backend-test-app && yarn dev`

### Full Integration Testing
1. Start backend-test-app: `cd backend-test-app && yarn dev`
2. Start frontend-test-app: `cd frontend-test-app && yarn dev`
3. Test biometric registration/authentication flow end-to-end

## Rules

### Package Manager
- **Project**: `yarn` (yarn add, yarn install)
- **Global**: `pnpm` (pnpm add -g)

### Root Directory Policy
Keep root clean. Only allowed files:
- CLAUDE.md, dev-prompts.md
- .gitignore
- No node_modules, package.json at root level

### File Organization
- Each project manages its own dependencies
- No hoisting or workspace configuration
- Each project has its own CLAUDE.md with project-specific details

### Gitignore Policy
- All reproduceable files ignored (node_modules, dist, build)
- Custom ignore patterns: `*.ignore.*`, `project-record-ignore/`
- Environment files ignored at root but may exist in test apps

### No Unnecessary Files
- Don't create docs/txt/record files unless explicitly requested
- Prefer editing existing files over creating new ones
- Keep documentation minimal and actionable

## Tech Stack Summary

### Frontend Package
- TypeScript, Capacitor 7, WebAuthn API
- Supports: React, Vue, Angular, Vanilla JS
- Platforms: Android (BiometricPrompt), iOS (LocalAuthentication), Web (WebAuthn)

### Backend Package
- TypeScript, Node.js 20+, WebAuthn Level 3
- Framework-independent (Express, Fastify, Koa, etc.)
- AES-256-GCM session encryption

### Test Apps
- Frontend: React + Vite + Capacitor
- Backend: Node.js + Express/GraphQL

## Important Notes

1. **Independent Git Repos**: Each subproject has its own `.git` - they were separate repos
2. **No Workspace**: This is not a yarn/npm workspace - each project is standalone
3. **Local Development**: For testing changes, use yarn link or copy built packages
4. **Own Implementation**: webauthn-server-buildkit is our own WebAuthn implementation, not using @simplewebauthn/server

## Security Considerations

- Never commit .env files with secrets
- WebAuthn requires HTTPS in production
- Use strong encryption secrets (32+ characters)
- Test apps may have less strict security for development purposes
