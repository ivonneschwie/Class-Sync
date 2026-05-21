<div align="center">

<img src="public/web-app-manifest-192x192.png" alt="ClassSync Logo" width="96" />

# ClassSync

**Your all-in-one academic companion — manage schedules, find study groups, and summarize notes with AI.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Configuration](#-configuration) · [Deployment](#-deployment) · [Contributing](#-contributing)

</div>

---

## 📖 Overview

ClassSync is a Progressive Web App (PWA) built for students to take control of their academic life. It combines smart schedule management, automated conflict detection, collaborative study group matching, AI-powered note summarization, and flashcard generation — all in one clean, responsive interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📅 **Schedule Management** | Add classes with times, locations, and instructor names. View your full weekly timetable at a glance. |
| ⚠️ **Conflict Detection** | Automatically detects and alerts you when two classes overlap in time. |
| 🤝 **Study Group Finder** | Browse and connect with classmates in the same courses based on study preferences. |
| 📓 **Markdown Notebook** | Rich note editor with live Markdown preview, formatting toolbar, word/character stats, reading time estimates, and interactive checklists. |
| 🤖 **AI Note Summarization** | Summarize lecture notes into concise study guides using the OpenRouter AI API (free tier supported). |
| 🃏 **AI Flashcard Generator** | Auto-generate flashcard decks from your notes via OpenRouter AI. |
| 📤 **Resource Sharing** | Share your schedule, lessons, or decks with others via unique 6-digit codes. |
| 🎨 **16 Accent Color Themes** | Choose from 16 accent colors (lavender, red, teal, blue, etc.) that persist across sessions. |
| 🌗 **Dark / Light Mode** | Full theme support with system preference detection. |
| 📱 **PWA Support** | Installable on mobile and desktop as a native-like app. |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router + Pages Router API routes, Turbopack)
- **Language:** TypeScript 5
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling:** Tailwind CSS 3
- **Backend / Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **AI:** [OpenRouter](https://openrouter.ai/) (free-tier model routing for summarization & flashcard generation)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React
- **Fonts:** Space Grotesk (headlines) · PT Sans (body)

---

## 📋 Requirements

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18.x or later | LTS recommended |
| [npm](https://www.npmjs.com/) | 9.x or later | Bundled with Node.js |
| [Git](https://git-scm.com/) | Any recent version | For cloning the repo |
| A Firebase Project | — | Free Spark plan works for development |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ivonneschwie/Class-Sync.git
cd Class-Sync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root. You can copy the example below:

```bash
cp .env.example .env
```

Then fill in your Firebase credentials (see [Configuration](#-configuration)).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## ⚙️ Configuration

ClassSync requires a Firebase project with **Authentication** and **Firestore** enabled.

### Setting Up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Email/Password** authentication under **Authentication → Sign-in method**.
3. Create a **Firestore** database in production mode.
4. Register a **Web App** and copy the SDK config snippet.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Firebase Web App Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=           # Optional

# AI Services (server-side only — NOT exposed to the browser)
OPENROUTER_API_KEY=your_openrouter_api_key      # Required for AI summarization & flashcard generation
GOOGLE_GENAI_API_KEY=your_genai_api_key         # Optional — for Genkit flows if used
GEMINI_API_KEY=your_gemini_api_key              # Optional — alias for Google AI
```

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Server-only keys like `OPENROUTER_API_KEY` are never sent to the client. Never commit your `.env` file — it is already included in `.gitignore`.
>
> Get a free OpenRouter API key at [openrouter.ai/keys](https://openrouter.ai/keys).

### Firestore Security Rules

Deploy the included security rules to your Firestore database:

```bash
npx firebase-tools deploy --only firestore:rules
```

The rules ensure users can only read and write their own data. Shared resources (schedule codes, decks) are readable by anyone but writable only by the creator.

---

## 📁 Project Structure

```
classsync/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Schedule (home) page
│   │   ├── timetable/              # Weekly timetable view
│   │   ├── notebook/               # Markdown notebook with AI summarization
│   │   ├── flashcards/             # Flashcard decks & AI generator
│   │   ├── study-groups/           # Study group finder
│   │   ├── class/                  # Individual class detail
│   │   ├── profile/                # User profile
│   │   ├── settings/               # App settings (theme, accent color)
│   │   ├── login/                  # Authentication
│   │   └── signup/                 # Registration
│   ├── pages/
│   │   └── api/ai/openrouter/      # Server-side API routes (Pages Router)
│   │       ├── summarize.ts        # AI note summarization endpoint
│   │       └── generate-flashcards.ts  # AI flashcard generation endpoint
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── add-class-form.tsx      # Class creation form
│   │   ├── class-card.tsx          # Schedule card component
│   │   ├── color-theme-provider.tsx # 16-color accent theme system
│   │   ├── theme-toggle.tsx        # Dark/light mode + accent color picker
│   │   ├── summary-history.tsx     # AI summary history
│   │   ├── share-button.tsx        # Resource sharing
│   │   └── main-layout.tsx         # App shell & navigation
│   ├── context/                    # React context providers
│   ├── firebase/                   # Firebase client setup
│   │   ├── config.ts               # Firebase app config
│   │   ├── index.ts                # Exports & initialization
│   │   └── firestore/              # Firestore hooks
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities & type definitions
│   │   ├── markdown-compiler.tsx   # Custom Markdown → React renderer
│   │   ├── types.ts                # Shared TypeScript interfaces
│   │   └── utils.ts                # General helpers (cn, etc.)
│   └── services/                   # Data service layer
│       ├── FlashcardService.ts
│       └── NotebookService.ts
├── public/                         # Static assets & PWA icons
├── firestore.rules                 # Firestore security rules
├── apphosting.yaml                 # Firebase App Hosting config
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server on port 9002 (Turbopack) |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking without emitting |

---

## 🚢 Deployment

ClassSync is configured for **Firebase App Hosting**.

### Deploy to Firebase App Hosting

```bash
# Authenticate with Firebase
npx firebase-tools login

# Set your active project
npx firebase-tools use your-project-id

# Deploy the app
npx firebase-tools deploy
```

The `apphosting.yaml` file controls runtime settings such as auto-scaling instance limits.

---

## 🔒 Security

- All user data in Firestore is protected by security rules — users can only access their own documents.
- Shared resources use a public read / authenticated write pattern with owner-only delete/update.
- Firebase API keys included in `NEXT_PUBLIC_` variables are safe to expose to the browser, but should be restricted by **HTTP referrers** in the [Google Cloud Console](https://console.cloud.google.com/) for production use.
- Never commit `.env` files or service account keys.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ for students, by students.
</div>
