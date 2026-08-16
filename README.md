# CoreTana

A private, local Apex teacher and sparring partner. No account, no server,
nothing about your progress or your code ever leaves your machine except
the specific message you send her, which goes straight to Anthropic's API
using your own key.

She idles as a living orb. When you start a drill set, she transforms into
a holographic figure with a blue glow — that's sparring mode, and her voice
gets shorter and sharper to match.

This is the first slice of a much bigger curriculum (see the roadmap in the
sidebar) — right now there's one full module, **Variables & Data Types**,
wired end to end: lesson content, freeform Q&A with CoreTana, and a drill
set she grades live.

## What this is, technically

A local desktop app (Electron + React + TypeScript), not a website. Nothing
is hosted. When you run it, a window opens on your machine and that's the
whole footprint — no accounts, no telemetry, no cloud database.

The only network calls it makes are direct, from your machine to
`api.anthropic.com`, using an API key you provide.

## Prerequisites

You need [Node.js](https://nodejs.org) installed (v20 or newer). If you've
never used Node before: install it from that link, then everything below
runs in a terminal in this project folder.

You also need an Anthropic API key. Get one at
[console.anthropic.com](https://console.anthropic.com) — it's pay-as-you-go,
and Apex tutoring conversations are cheap (fractions of a cent to a few
cents per message).

## Running it locally (recommended while you're building it out)

```bash
npm install
npm run dev
```

This opens CoreTana in a window on your machine, with hot-reload — any code
change you make shows up instantly. First launch will ask you to paste your
API key; it's encrypted with your OS's own keychain (`safeStorage` in
Electron) and saved to your local user data folder. It is never written
anywhere else, never committed to this repo, and never sent anywhere except
directly to Anthropic when CoreTana replies.

## Building an installable app (the "exe")

You said you've never built one of these before — here's the whole process:

```bash
npm run package
```

This uses [electron-builder](https://www.electron.build) to produce a real
installer for your OS in a new `release/` folder:

- **Windows** → a `CoreTana-<version>-setup.exe` you double-click to install
- **macOS** → a `.dmg` you drag to Applications
- **Linux** → an `.AppImage` you can run directly

That installer is the actual program — from then on you launch CoreTana
like any other app on your machine, no terminal required. You only need
`npm run dev` again if you want to change the code.

You're building this on your own machine for your own use, so there's no
code-signing step required — Windows/macOS may show an "unknown publisher"
warning on first launch, which is normal and safe to click through for your
own unsigned build.

## Privacy & security notes

- Nothing is hosted publicly. There is no server component to secure.
- Your API key is encrypted at rest via your OS keychain and stored only in
  Electron's local `userData` folder, not in this repository.
- The renderer (the UI) has no direct Node.js or filesystem access — it can
  only reach the outside world through a small, explicit bridge
  (`src/preload/index.ts`) that exposes exactly the calls it needs and
  nothing else. This is standard Electron hardening
  (`contextIsolation` + `sandbox`, no `nodeIntegration`).
- All API calls to Anthropic happen in the main process, not the renderer —
  your key is never exposed to any web content.
- If you ever want to revoke access, delete the key from the in-app
  settings (clears the encrypted file) and/or roll the key in the Anthropic
  console.

## Project layout

```
src/
  main/        Electron main process — window creation, the Anthropic
               client, the API-key store, CoreTana's persona/system prompt
  preload/     The one narrow, typed bridge exposed to the UI
  renderer/    The React app: avatar, lesson view, quiz engine, chat
  shared/      Types shared between main and renderer (IPC contract,
               render-tag parsing)
```

CoreTana's full character sheet lives in `src/main/persona.ts` — edit it
there if you want to tune her voice, add new modes, or adjust how the
render tags map to the avatar (see `src/renderer/src/components/
CoreTanaAvatar.tsx` / `.css` for the visual side of those tags).

## What's next

The roadmap sidebar lists the rest of the curriculum from beginner to
advanced (collections, SOQL, triggers, governor limits, async Apex, and
so on) — those modules aren't built yet. Adding one means: writing a
`Lesson` object like `src/renderer/src/content/variablesAndDataTypes.ts`,
registering it in `content/lessons.ts`, and flipping its `available` flag
in `content/curriculum.ts`.
