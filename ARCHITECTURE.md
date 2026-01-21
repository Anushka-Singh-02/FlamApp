# Architecture Documentation

## Data Flow Diagram

```
[User Action] → [Client JS] → [Socket.io] → [Server] → [Socket.io] → [Other Clients] → [Canvas Update]
```

- Mouse events (draw, erase, move) are captured on the client.
- Drawing data is sent via Socket.io to the server.
- Server broadcasts drawing events to all other clients.
- Each client updates its canvas and cursor positions in real time.

## WebSocket Protocol

- **draw**: `{ startX, startY, endX, endY, color, width, isEraser, strokeId }`
- **mouse-move**: `{ x, y, id }`
- **clear**: `{}` (no payload)
- **undo/redo**: `{}` (no payload)
- **init**: `[history]` (full canvas state)
- **user-joined**: `{ id, name }`
- **user-left**: `{ id }`

## Undo/Redo Strategy

- Each stroke is assigned a unique `strokeId` and associated with a user.
- Undo removes the most recent stroke for the requesting user, but since history is global, it may affect other users' drawings.
- Redo restores the last undone stroke.
- The server maintains a history array and broadcasts the updated state after undo/redo.

## Performance Decisions

- Drawing events are streamed individually for immediate feedback.
- Canvas redraws are optimized by only re-rendering changed segments.
- Mouse events are throttled to avoid flooding the network.
- User cursors are lightweight DOM elements, not canvas objects, for fast updates.

## Conflict Resolution

- Strokes are grouped by `strokeId` and user.
- Undo/redo operations are global; if two users draw simultaneously, undo will remove the last stroke regardless of author.
- No locking or merging; the system favors simplicity and responsiveness.

## Why These Choices?

- Socket.io was chosen for its reliability and ease of use over native WebSockets.
- Vanilla JS and Canvas API were used to demonstrate direct control over drawing logic.
- Undo/redo is global for simplicity, but could be extended to per-user or per-room in future versions.
- All state is kept in memory for speed; persistence could be added if needed.
