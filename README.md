# ChessMate — Living 3D Chess Companion

An interactive React + TypeScript chess web app powered by Stockfish with a live Three.js 3D companion (**Bruno**), custom anime/fantasy chess pieces, capture elimination VFX, Unlimited-time 3D board walking, and multi-provider voice synthesis.

## Features

- **3D Living Companion**: Unframed Three.js companion above the board with mood reactions, interactive match bets/dares, drag **Free Roam**, and a right-sidebar control panel (**Ask Hint**, **Board Vibe**, **Chat / Hype**, **Personality**, **Voice API**).
- **Unlimited-Mode 3D Board Walker**: When time control is set to `∞ Unlimited`, Bruno walks out from above the board to pick up, carry, and capture pieces in real time.
- **Custom Chess Pieces & Superpowers**: Toggleable per-piece visual styles and **One-Eyed Bishop** / **Laser** abilities, plus a **Custom Character Generator** (`White Only`, `Black Only`, or `Both Sides`) rendering cel-shaded anime cutout pieces.
- **Capture Elimination FX**: Unique capture animations per piece type (Pawn sword slash, Bishop pistol shot, etc.) with a quick ON/OFF toggle.
- **Voice API Support**: Supports ElevenLabs, OpenAI TTS, free StreamElements neural voices, and browser speech synthesis fallback.

## Getting Started

```bash
npm install
cp .env.example .env.local # optionally add VITE_ELEVENLABS_API_KEY
npm run dev
```

## Build & Deploy (GitHub Pages)

```bash
npm run build
npm run preview
```

This repository includes `.github/workflows/deploy.yml`, which automatically builds with the repository subpath (`GITHUB_REPOSITORY`) and deploys to your GitHub Pages domain (`https://<username>.github.io/<repo>/`) on every push to `main`.

> **Note:** Enable GitHub Pages via **Settings → Pages → Source: GitHub Actions** if it does not auto-enable on your first push.

