# ClassSync

Manage your school schedule, find study groups, and summarize notes with AI.

## GitHub Authentication Troubleshooting

If you see an error like `remote: Invalid username or token` when trying to push your code, follow these steps:

### The Reliable Method: Personal Access Token (PAT)
GitHub no longer accepts your account password for Git operations. You must use a token instead.

1. **Generate Your Token:**
   - Go to GitHub.com and sign in.
   - Click your profile photo (top right) -> **Settings**.
   - On the left sidebar, scroll to the bottom and click **Developer settings**.
   - Click **Personal access tokens** -> **Tokens (classic)**.
   - Click **Generate new token** -> **Generate new token (classic)**.
   - **Note:** "ClassSync-Studio"
   - **Expiration:** 90 days (or "No expiration" for convenience).
   - **Scopes:** Check the box for **repo**.
   - Scroll to the bottom and click **Generate token**.
   - **Copy the token immediately.** You will not be able to see it again.

2. **Use the Token in VS Code:**
   - Run your git command (e.g., `git push origin main`).
   - When prompted for a **Username**, type your GitHub username.
   - When prompted for a **Password**, **PASTE THE TOKEN** you just copied. 
   - *Note: The terminal won't show any characters while you paste. Just paste and hit Enter.*

### If you want VS Code to handle it automatically:
- Look at the bottom-left corner of VS Code for the **Accounts** icon (a small person silhouette). 
- If you don't see it, right-click any icon on the far-left sidebar (like the Explorer or Search icons) and make sure **Accounts** is checked in the menu.
- Click the Accounts icon and select **Sign in to Sync Settings** or **Sign in with GitHub**.

## Features
- **Schedule Management**: Keep track of your weekly classes.
- **AI Summarizer**: Convert lecture notes into concise study guides.
- **Flashcards**: Automatically generate flashcards from your notes.
- **Resource Sharing**: Share lessons and decks via unique 6-digit codes.
