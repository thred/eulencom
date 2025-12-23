# Copilot Instructions - eulencom

## Project Overview

This is a text-based adventure game learning platform built with TypeScript and vanilla JavaScript. The game runs entirely in the browser as a single-page application with no backend. It's designed as a teaching tool for understanding TypeScript, game state management, and DOM manipulation.

## Architecture

**Single-File Game Engine**: All game logic lives in `game.ts` (~800 lines), which compiles to `game.js`. The architecture uses:

- **Interface-driven design**: `Room` and `GameState` interfaces define the data structures
- **State machine**: The `gameState` object is the single source of truth for all game progression
- **Room-based navigation**: The `rooms` object maps room keys to their definitions with exits, descriptions, and items

**Key architectural pattern**: Game state changes trigger UI updates through imperative DOM manipulation (no framework). State changes happen in command handlers (`handleMove`, `handleTake`, `handleUse`), which then call `printLine()` to output results.

## Development Workflow

**Build system**: TypeScript compilation only, no bundler

```bash
npm run build      # Compile game.ts to game.js (ES2017 target)
npm run watch      # Auto-rebuild on changes
npm start          # Starts http-server on port 8000
```

**File structure convention**:

- `game.ts` - Source code (edit this)
- `game.js` - Compiled output (committed to repo for GitHub Pages deployment)
- `index.html` - Static entry point loading game.js
- `style.css` - Terminal-style UI styling

**Deployment**: The `npm run deploy` script builds, commits, and pushes. The repo uses GitHub Pages to serve the static site directly from main branch.

## Code Patterns & Conventions

**Command parsing**: All user input flows through `handleCommand()` which:

1. Normalizes input to lowercase
2. Splits into action + target
3. Routes to specific handlers via switch statement
4. Supports command aliases (e.g., "l" for "look", "inv" for "inventory")

**State management pattern**: Boolean flags track progress:

```typescript
gameState.lightsOn; // Controls room description visibility
gameState.doorLocked; // Gates progression to final room
gameState.dressed; // Win/lose condition check
gameState.wardrobeOpen; // Reveals items conditionally
```

**Item system**: Items are strings in `room.items[]` arrays. Taking an item moves it from room to `gameState.inventory[]`. Some interactions reveal new items (e.g., picking up Commodore reveals key underneath).

**UI interaction**: Click-to-add-word pattern - any word in output text can be clicked to append to command input, creating a pseudo-graphical interface for text commands.

## Critical Implementation Details

**Dark/light mechanic**: Bedroom has two descriptions (`description` vs `darkDescription`). The `lightsOn` flag determines which displays and what actions are available. Many commands fail in the dark with specific error messages.

**Special navigation**: Not all directions create room transitions:

- Going WEST in bedroom examines wardrobe (doesn't move rooms)
- Going SOUTH in bedroom examines desk (doesn't move rooms)
- Only NORTH exit leads to new rooms (win/lose endings)

**Win/lose conditions**: Game has three room endings:

- `hallway` - Win state (opened door while dressed)
- `hallwayFail` - Lose state (opened door naked)
- Both set flags that block further commands except CLEAR/HELP

**Easter egg**: Using the Commodore 64 (`USE COMMODORE`) opens an external game (Ultima V) in new window - demonstrates external integration pattern.

## Extending the Game

To add new rooms or features:

1. Define new room in `rooms` object with `name`, `description`, `exits`, optional `items`
2. Update existing room's `exits` to connect to new room
3. Add any new state flags to `GameState` interface and initialize in `gameState`
4. Create command handlers or extend existing ones in `handleCommand()` switch
5. Rebuild with `npm run build`

Example: To add a "kitchen" room accessed from hallway, add `exits: { south: "kitchen" }` to hallway room definition and define the kitchen room structure.

## Testing Strategy

No automated tests. Manual testing via:

1. `npm start` to launch game
2. Walk through game paths: turn on lights → open wardrobe → take clothes → wear clothes → use commodore → take key → use key → go north
3. Test fail state: skip wearing clothes before going north
4. Test dark state interactions: try commands before turning on lights

## Common Development Tasks

**Adding new command**: Add case to `handleCommand()` switch, create handler function following `handle*` naming convention

**Changing room descriptions**: Edit strings in `rooms` object - no code changes needed

**Adding conditional behavior**: Add boolean to `GameState`, initialize in `gameState`, check in relevant handlers

**Styling changes**: All visual styling in `style.css` - terminal theme with green text on black background, monospace font
