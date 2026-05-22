# ClassSync

Hi, I'm Mark Angelo Landingin, a 3rd-Year BSCS (Bachelor of Science in Computer Science) student at Universidad de Dagupan. 

ClassSync is a Progressive Web App (PWA) built using Next.js 15, Firebase, and OpenRouter AI. It brings schedule management, conflict detection, collaborative study groups, a markdown notebook, and AI-powered study tools together into a single, clean workspace.

---

## Features

Here is a quick look at the features I built:

* **Schedules & Conflicts:** Add classes with location and instructor details. The app checks for overlaps automatically to prevent schedule conflicts.
* **Markdown Notebook:** A built-in notes editor featuring live preview, word counts, reading time estimates, and interactive checklists.
* **AI Summaries & Flashcards:** Summarize long lecture notes and auto-generate study flashcard decks using OpenRouter AI.
* **6-Digit Share Codes:** Instantly share timetables, lessons, or flashcard decks with classmates using a unique code.
* **Personalized Themes:** Choose from 16 custom accent colors that persist across sessions, supporting light, dark, and system modes.

---

## Tech Stack

Here are the technologies I chose to build this application:

* **Framework:** Next.js 15 (utilizing App Router for the front-end layout and Pages Router for server-side API routes)
* **Language:** TypeScript 5
* **Database & Authentication:** Firebase (Cloud Firestore and Firebase Auth)
* **AI Integration:** OpenRouter API (routing queries server-side for note summaries and flashcard generation)
* **Styling:** Tailwind CSS 3 with shadcn/ui and Radix UI primitives
* **Icons & Fonts:** Lucide React, Space Grotesk (headlines), and PT Sans (body copy)
* **Form Management:** React Hook Form validated with Zod

---

## Getting Started

If you want to run the project locally on your machine, follow these steps.

### 1. Clone the repository
```bash
git clone https://github.com/ivonneschwie/Class-Sync.git
cd Class-Sync
```

### 2. Install dependencies
Ensure you have Node.js 18.x or later installed, then run:
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root of the project by copying the example template:
```bash
cp .env.example .env
```
Open the `.env` file and insert your Firebase and OpenRouter API credentials (see the Configuration section below for details).

### 4. Run the local development server
```bash
npm run dev
```
The server will boot up on `http://localhost:9002`.

---

## Configuration

ClassSync relies on Firebase services for authentication and database storage, and OpenRouter for AI tasks.

### Firebase Setup
1. Create a project in the Firebase Console.
2. Enable Email/Password authentication in Authentication under Sign-in methods.
3. Initialize a Cloud Firestore database in production mode.
4. Register a Web App in your Firebase project and copy the configuration object.

### Environment Variable Guide
In your `.env` file, fill in the following variables:

```env
# Firebase Web App Config (Exposed to the browser via NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_optional_measurement_id

# AI API Keys (Server-side only, never exposed to the client)
OPENROUTER_API_KEY=your_openrouter_api_key
GOOGLE_GENAI_API_KEY=your_optional_google_genai_api_key
GEMINI_API_KEY=your_optional_gemini_api_key
```

*Note: The variables starting with `NEXT_PUBLIC_` are loaded by the Next.js client-side bundle and are visible to the browser. Server keys such as `OPENROUTER_API_KEY` are kept strictly server-side and will not be leaked.*

### Deploying Firestore Rules
To secure the database, you must deploy the security rules defined in the root `firestore.rules` file. These prevent unauthorized cross-user reads/writes:
```bash
npx firebase-tools deploy --only firestore:rules
```

---

## Project Structure

Here is a map of the ClassSync codebase to help you navigate:

```
classsync/
├── src/
│   ├── app/                        # Next.js App Router (UI pages and views)
│   │   ├── page.tsx                # Class schedule homepage
│   │   ├── timetable/              # Weekly grid schedule view
│   │   ├── notebook/               # Note editor and AI summary interface
│   │   ├── flashcards/             # Deck manager and study flow
│   │   ├── study-groups/           # Study partner and group matching
│   │   ├── class/                  # Class details page
│   │   ├── profile/                # User profile and details
│   │   ├── settings/               # App configuration (themes and colors)
│   │   ├── login/                  # Log in page
│   │   └── signup/                 # Register page
│   ├── pages/
│   │   └── api/ai/openrouter/      # Server-side API endpoints (Pages Router)
│   │       ├── summarize.ts        # AI note summarization endpoint
│   │       └── generate-flashcards.ts  # AI flashcard generation endpoint
│   ├── components/                 # React UI components
│   │   ├── ui/                     # shadcn UI core design elements
│   │   ├── add-class-form.tsx      # Form for adding classes
│   │   ├── class-card.tsx          # Card representing a class session
│   │   ├── color-theme-provider.tsx # Accent color state context
│   │   ├── theme-toggle.tsx        # Accent and light/dark toggles
│   │   ├── summary-history.tsx     # Notebook summary log
│   │   ├── share-button.tsx        # Share code generators
│   │   └── main-layout.tsx         # Sidebar navigation and main shell
│   ├── context/                    # React context providers
│   ├── firebase/                   # Firebase configuration and initialization
│   │   ├── config.ts               # Client Firebase config mapping
│   │   ├── index.ts                # Main export entrypoint
│   │   └── firestore/              # Firestore data fetching hooks
│   ├── hooks/                      # General utility hooks
│   ├── lib/                        # TypeScript interfaces and compilers
│   │   ├── markdown-compiler.tsx   # Custom MD parsing logic
│   │   ├── types.ts                # App-wide interfaces
│   │   └── utils.ts                # Tailwind merge and styling utilities
│   └── services/                   # Business layer services
│       ├── FlashcardService.ts
│       └── NotebookService.ts
├── public/                         # PWA assets, manifest, and logos
├── firestore.rules                 # Security rules file for Cloud Firestore
├── apphosting.yaml                 # Configuration for Firebase App Hosting
├── next.config.ts                  # Next.js bundler config
├── tailwind.config.ts              # Tailwind CSS styling tokens
└── package.json
```

---

## Available Development Scripts

You can run the following package commands from the project root:

* `npm run dev` - Launches the local development server with Turbopack on port 9002.
* `npm run build` - Compiles the application for production deployment.
* `npm run start` - Runs the built production server locally.
* `npm run lint` - Runs ESLint to check for stylistic errors.
* `npm run typecheck` - Compiles TypeScript types to ensure no compilation errors exist.

---

## Security Architecture

1. **User Segregation:** Standard database documents (notes, schedule records, user preferences) are isolated. Firestore security rules prevent users from reading or editing any documents they do not own.
2. **Resource Sharing:** Shared resources use a special document schema that allows read access using the unique 6-digit sharing code, but modifications are blocked. Only the original owner can update or delete the shared source document.
3. **API Key Security:** Server-side keys (like OpenRouter) are kept out of the client bundle. For Firebase keys, while they are public in the client script, you should restrict their usage in the Google Cloud Console to specific referrers before launching to production.

---

## Deployment

ClassSync is configured for Firebase App Hosting, which automatically manages serverless builds and scaling.

To deploy the app using the Firebase CLI:
```bash
# Log in to your Firebase account
npx firebase-tools login

# Set your active project ID
npx firebase-tools use your-project-id

# Deploy the configuration and source code
npx firebase-tools deploy
```
The deploy process will read `apphosting.yaml` to spin up Next.js SSR servers and link resources automatically.

---

This project was built to make learning organized and interactive. Thank you for exploring ClassSync.
