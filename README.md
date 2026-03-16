# ChatGPT Prompt Library — Chrome Extension

A Chrome extension to save, organize, and one-click insert prompts into ChatGPT.

## Features

**Free**
- Up to 15 prompts
- Folders & organization
- Variable substitution `{var}`
- Search within folder

**Basic ($5/mo)**
- Up to 100 prompts
- Export & Import JSON backup
- Edit prompts
- Prompt count badges
- Full prompt preview

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Chrome Extension Manifest V3
- Dodo Payments (billing)

## Development

```bash
npm install
npm run dev      # watch mode
npm run build    # production build
```

## Project Structure

```
src/
├── background/   # Service worker
├── content/      # Injected sidebar + components
├── popup/        # Extension popup
└── lib/          # Storage, tier, types
```

## Payment Flow

1. User clicks **Get Basic** → redirected to Dodo Payments checkout
2. On successful payment, Dodo fires a webhook to the backend
3. Backend generates a license key and emails it to the user
4. User enters the license key in the extension to activate Basic tier

## Backend

See [chatgpt-prompt-library-backend](https://github.com/ayush23dash/chatgpt-prompt-library-backend) for the Vercel serverless backend.
