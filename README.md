# MD Reader

A browser-based Markdown reader with multiple themes, multi-file tabs, and AI-powered text analysis.

Live at: **https://xalebxen99.github.io/MD-Reader/**

## Features

- **Upload & Render** -- Drag and drop or browse to select `.md` files, rendered instantly with GitHub-style formatting
- **Multi-file Tabs** -- Open multiple Markdown files at once, switch between them with tabs. Files persist in localStorage across page refreshes
- **Themes** -- Switch between four visual themes via the dropdown in the top right:
  - **Default** -- Clean GitHub-style white theme
  - **Sci-Fi** -- Dark navy with neon cyan accents and glowing effects
  - **Pixel Art** -- Retro 8-bit aesthetic with pixel fonts and chunky borders
  - **Office** -- Warm paper tones with serif fonts, like writing on quality paper
- **AI Text Analysis** -- Highlight any text in the rendered Markdown and click "Ask AI" to ask questions about the selection (powered by Google Gemini)
- **Syntax Highlighting** -- Code blocks are highlighted with highlight.js, theme-matched
- **Fully Client-Side** -- No server, no backend. Everything runs in your browser.

## AI Setup

The AI feature uses the Google Gemini API (free tier).

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Generate a free API key
3. Click the gear icon in the app and paste your key
4. The key is stored in your browser's localStorage only

## Usage

1. Open the app
2. Drag a `.md` file onto the drop zone or click "Browse files"
3. The file renders with full GitHub-style Markdown formatting
4. Use the theme dropdown (top right) to switch visual themes
5. Open additional files with the + button next to your tabs
6. Highlight text in any rendered file and click "Ask AI" to query it

## Tech Stack

- HTML / CSS / Vanilla JavaScript
- [marked](https://github.com/markedjs/marked) -- Markdown parsing
- [highlight.js](https://highlightjs.org/) -- Code syntax highlighting
- [Google Fonts](https://fonts.google.com/) -- Orbitron, Press Start 2P, Outfit, Lora, Inter
- Google Gemini API -- AI text analysis
