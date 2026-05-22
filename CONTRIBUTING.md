# Contributing to ClassSync

As a student developer, building ClassSync has been a huge learning experience. If you are interested in making the app better, adding features, or correcting bugs, I would love your help. 

This document outlines how to set up your environment, follow the conventions I used, and submit changes to the repository.

---

## Codebase Conventions

To ensure the project stays clean and maintainable, please follow these guidelines when writing code.

### TypeScript and Data Validation
* Prefer explicit TypeScript declarations over `any`.
* Use Zod schemas for validating form inputs and database payloads.

### Components and UI
* Keep React components small, focused, and functional.
* Rely on the existing shadcn/ui and Radix UI primitives.
* Avoid writing custom ad-hoc utility styles in component files. If you need new styling variables or custom colors, update the design tokens in `tailwind.config.ts`.
* Component names should use PascalCase, variables and functions camelCase, and file names kebab-case.

### Database access
* Do not call the Firebase SDK directly inside UI components.
* Instead, routing through the database hooks in `src/firebase/firestore/` or using services inside `src/services/` makes it easier to manage state and query boundaries.

### Project Directory Layout
* Frontend views go in Next.js App Router folders under `src/app/`.
* Reusable components belong in `src/components/`.
* Server endpoints (such as OpenRouter API connectors) should go in `src/pages/api/`.
* If your contribution adds a new collection or changes database schema fields, update `firestore.rules` accordingly.

---

## Getting Started with Development

1. Fork this repository on GitHub.
2. Clone your forked copy to your local machine:
   ```bash
   git clone https://github.com/<your-username>/Class-Sync.git
   cd Class-Sync
   ```
3. Initialize the development environment:
   ```bash
   npm install
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Firebase details to the `.env` file.
5. Launch the local environment:
   ```bash
   npm run dev
   ```

---

## Workflow and Branching

Before you begin working on a feature, synchronize your fork's main branch with the upstream codebase:
```bash
git remote add upstream https://github.com/ivonneschwie/Class-Sync.git
git fetch upstream
git rebase upstream/main
```

Create a new branch naming it based on the work you are doing:
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

After modifying the code, run type and lint checks:
```bash
npm run lint
npm run typecheck
```

---

## Commit Guidelines

I follow the Conventional Commits specification. This keeps the commit history easy to read and trace. Structure your commit messages as follows:

```
type(scope): description
```

Here are the common types you should use:

* **feat**: Introducing a new capability.
* **fix**: Resolving a bug or error.
* **refactor**: Rewriting code without modifying features or resolving bugs.
* **style**: Changing formatting, white space, or spelling errors.
* **docs**: Modifying README, CONTRIBUTING, or code comments.
* **chore**: Updating build processes, dependencies, or config files.

Examples:
* `feat(notebook): add markdown export option`
* `fix(schedule): resolve timing overlap validation edge-case`
* `docs: update setup documentation in README`

---

## Submitting a Pull Request

When you are ready to merge your branch, go through this checklist:

1. Confirm that `npm run lint` and `npm run typecheck` complete without warnings or errors.
2. Verify that your branch is rebased with the current upstream `main` branch.
3. Ensure no local configuration files, API keys, or `.env` details are included in the commits.
4. If your feature modifies how data is saved to Firestore, ensure the rules in `firestore.rules` reflect the database changes.
5. In your Pull Request description, explain clearly what was added or resolved and why.

Thank you for contributing to ClassSync.
