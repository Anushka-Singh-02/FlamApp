# Real-Time Collaborative Drawing Canvas

## Overview

This project is a multi-user collaborative drawing app built with Node.js, Socket.io, and vanilla JavaScript. Multiple users can draw together in real time, see each other's cursors, and use undo/redo features that work globally across all users.

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/collaborative-canvas.git
   cd collaborative-canvas
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`.

## Testing with Multiple Users

- Open the app in several browser windows or tabs, or share your local network IP with others on the same WiFi.
- Each user will see their own cursor and others' cursors in real time.
- Drawing, erasing, undo, and redo actions are synchronized instantly.

## Known Limitations / Bugs

- Undo/redo is global, so one user's undo may affect another's recent strokes.
- No authentication; all users are anonymous.
- No persistent storage—refreshing the page clears the canvas.
- Mobile support is basic; touch events may be less smooth than mouse.

## Time Spent

- Planning & architecture: 4 hours
- Canvas drawing logic: 5 hours
- Real-time sync & Socket.io: 3 hours
- Undo/redo & state management: 4 hours
- UI/UX & user list: 2 hours
- Testing & bug fixes: 2 hours
- Documentation: 1 hour

_Total: ~21 hours_
