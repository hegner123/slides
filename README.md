# slides

A Go server that discovers and serves slide decks from nested directories. Each subdirectory containing an `index.html` is a deck. Deck ordering is managed via SQLite. Speaker notes sync bidirectionally between the presentation and a separate notes window.

## Features

- Auto-discovers slide decks from subdirectories on each request (hot reload)
- SQLite-backed deck ordering with automatic registration of new decks
- Speaker notes endpoint with bidirectional sync via BroadcastChannel
- Embedded HTML templates for the landing page and notes viewer
- Path traversal protection on all file serving
- Graceful shutdown on SIGINT/SIGTERM
- Gradient-themed landing page with 4-column deck grid

## Prerequisites

- Go 1.25+
- Slide decks are React + TanStack Router apps built with Vite (Node.js 18+ for building decks)

## Installation

```bash
go install github.com/hegner123/slides@latest
```

Build from source:

```bash
git clone https://github.com/hegner123/slides.git
cd slides
go build -o slides .
```

## Usage

Run the server from a directory containing slide deck subdirectories:

```bash
./slides
# Slides server running at http://localhost:6100
```

The server serves on port 6100. Any subdirectory with an `index.html` appears as a deck on the landing page.

Speaker notes for a deck are served at `/notes/<deck-name>/`. Place markdown files (`1.md`, `2.md`, etc.) in a `notes/` directory inside the deck.

### Endpoints

| Path | Purpose |
|------|---------|
| `/` | Landing page with deck grid |
| `/deck/<name>/` | Slide deck |
| `/notes/<name>/` | Speaker notes (syncs with deck) |

### Creating a Deck

```bash
mkdir my-deck
# Add index.html, style.css, script.js (or a React/Vite build)
# Optionally add notes/1.md, notes/2.md, etc.
```

## License

[MIT](LICENSE)
