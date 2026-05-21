# Contributing to ClassSync

Thank you for taking the time to contribute! 🎉  
This guide will help you get set up and ensure your contributions fit the project's style and workflow.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Code Style](#code-style)
- [Project Structure Tips](#project-structure-tips)
- [Reporting Issues](#reporting-issues)
- [Pull Request Checklist](#pull-request-checklist)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Class-Sync.git
   cd Class-Sync
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up your environment variables:**
   ```bash
   cp .env.example .env
   # Fill in your Firebase credentials
   ```
5. **Start the dev server:**
   ```bash
   npm run dev
   # App runs at http://localhost:9002
   ```

---

## Development Workflow

1. Sync your fork with the upstream `main` branch before starting:
   ```bash
   git remote add upstream https://github.com/ivonneschwie/Class-Sync.git
   git fetch upstream
   git rebase upstream/main
   ```
2. Create a descriptive branch:
   ```bash
   git checkout -b feat/study-group-filters
   # or
   git checkout -b fix/schedule-conflict-edge-case
   ```
3. Make your changes, then run checks:
   ```bash
   npm run lint
   npm run typecheck
   ```
4. Commit using the [Conventional Commits](#commit-convention) format.
5. Push and open a Pull Request against `main`.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should look like:

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `docs` | Documentation only changes |
| `chore` | Build process, dependency updates, config changes |
| `test` | Adding or updating tests |

**Examples:**
```
feat(notebook): add markdown export for AI summaries
fix(schedule): prevent duplicate conflict toast on re-submit
docs: update environment variable instructions in README
```

---

## Code Style

- **TypeScript** — prefer explicit types over `any`. Use Zod schemas for form validation.
- **Components** — use functional components with hooks. Keep components small and focused.
- **Naming** — PascalCase for components/types, camelCase for variables/functions, kebab-case for files.
- **Imports** — use the `@/` path alias (configured in `tsconfig.json`).
- **UI** — use existing shadcn/ui primitives before building custom components. Do not add ad-hoc Tailwind utility classes to component files; extend the design tokens in `tailwind.config.ts` instead.
- **Firebase calls** — access Firestore through the hooks in `src/firebase/firestore/` rather than calling the SDK directly in components.

---

## Project Structure Tips

- **New pages** go in `src/app/<route>/page.tsx` following Next.js App Router conventions.
- **Shared UI components** go in `src/components/`.
- **Business logic / data fetching** belongs in `src/context/` (React Context) or `src/services/`.
- **Firebase Firestore rules** are in `firestore.rules` — update them if your feature stores new data shapes.

---

## Reporting Issues

When opening a bug report, please include:

- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Browser / OS / Node.js version
- Any relevant console errors or screenshots

Use the appropriate issue label (`bug`, `enhancement`, `question`, etc.).

---

## Pull Request Checklist

Before submitting your PR, make sure:

- [ ] `npm run lint` passes with no errors
- [ ] `npm run typecheck` passes with no errors
- [ ] Your branch is up to date with `main`
- [ ] The PR description clearly explains **what** changed and **why**
- [ ] New Firestore data shapes are reflected in `firestore.rules`
- [ ] No `.env` files, API keys, or secrets are committed

---

We look forward to your contribution! 🚀
