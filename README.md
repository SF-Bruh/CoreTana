# CoreTana

A private, local, **free** Apex teacher and sparring partner. No account, no
server, no subscription, no per-message bill. She runs entirely on your
machine, thinking with a free local model via [Ollama](https://ollama.com) —
nothing about your progress or your code ever leaves your computer, ever.

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
whole footprint — no accounts, no telemetry, no cloud database, no API
billing anywhere.

The only "network" call it makes is to `localhost:11434` — Ollama running on
your own machine. Nothing ever goes out to the internet.

## Prerequisites

You need [Node.js](https://nodejs.org) installed (v20 or newer). If you've
never used Node before: install it from that link, then everything below
runs in a terminal in this project folder.

You also need **[Ollama](https://ollama.com/download)** — a free app that
runs open-source language models locally. Install it, then pull a model:

```bash
ollama pull qwen2.5-coder:7b
```

That's a solid, code-aware model (~5GB, one-time download, no cost). If your
machine is limited on RAM, `ollama pull llama3.2` is a lighter fallback
(smaller, faster, a bit less sharp).

CoreTana will walk you through this same setup on first launch if you skip
straight to running her.

## Running it locally (recommended while you're building it out)

```bash
npm install
npm run dev
```

This opens CoreTana in a window on your machine, with hot-reload — any code
change you make shows up instantly. First launch checks for Ollama and lets
you pick which pulled model she should use — that choice is saved locally
and she remembers it next time.

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
like any other app on your machine, no terminal required (Ollama still needs
to be installed and running in the background, same as before). You only
need `npm run dev` again if you want to change the code.

You're building this on your own machine for your own use, so there's no
code-signing step required — Windows/macOS may show an "unknown publisher"
warning on first launch, which is normal and safe to click through for your
own unsigned build.

## Privacy & security notes

- Nothing is hosted publicly. There is no server component to secure, no
  account, and no API key of any kind.
- Every model call happens against `localhost:11434` — Ollama refuses
  connections from outside your machine by default, so nothing about your
  code or conversations ever crosses the network.
- The renderer (the UI) has no direct Node.js or filesystem access — it can
  only reach the outside world through a small, explicit bridge
  (`src/preload/index.ts`) that exposes exactly the calls it needs and
  nothing else. This is standard Electron hardening
  (`contextIsolation` + `sandbox`, no `nodeIntegration`).
- All calls to Ollama happen in the main process, not the renderer.

## Project layout

```
src/
  main/        Electron main process — window creation, the Ollama
               client, the model-choice store, CoreTana's persona/system prompt
  preload/     The one narrow, typed bridge exposed to the UI
  renderer/    The React app: avatar, lesson view, quiz engine, chat
  shared/      Types shared between main and renderer (IPC contract,
               render-tag parsing)
```

CoreTana's full character sheet lives in `src/main/persona.ts` — edit it
there if you want to tune her voice, add new modes, or adjust how the
render tags map to the avatar (see `src/renderer/src/components/
CoreTanaAvatar.tsx` / `.css` for the visual side of those tags).

Want to try a different local model later? Just pull it with Ollama and pick
it from the model list next time CoreTana asks (or delete
`coretana-model.json` from the app's local data folder to re-trigger the
picker).

## What's next

The roadmap sidebar lists the rest of the curriculum from beginner to
advanced (collections, SOQL, triggers, governor limits, async Apex, and
so on) — those modules aren't built yet. Adding one means: writing a
`Lesson` object like `src/renderer/src/content/variablesAndDataTypes.ts`,
registering it in `content/lessons.ts`, and flipping its `available` flag
in `content/curriculum.ts`.
