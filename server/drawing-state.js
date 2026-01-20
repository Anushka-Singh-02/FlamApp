export class DrawingState {
    constructor() {
        this.history = [];   // Main canvas state
        this.redoStack = []; // Temporary storage for undid strokes
    }

    add(line, userId) {
        this.history.push({ ...line, userId });
        // Clear redo stack for this user whenever they draw something new
        this.redoStack = this.redoStack.filter(item => item.userId !== userId);
    }

    undo(userId) {
        let lastStrokeId = null;
        // Find the last stroke ID for this user
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].userId === userId) {
                lastStrokeId = this.history[i].strokeId;
                break;
            }
        }

        if (!lastStrokeId) return false;

        // Move stroke to redo stack
        const strokeToUndo = this.history.filter(line => line.strokeId === lastStrokeId);
        this.redoStack.push(...strokeToUndo);

        // Remove from history
        this.history = this.history.filter(line => line.strokeId !== lastStrokeId);
        return true;
    }

    redo(userId) {
        let lastRedoId = null;
        for (let i = this.redoStack.length - 1; i >= 0; i--) {
            if (this.redoStack[i].userId === userId) {
                lastRedoId = this.redoStack[i].strokeId;
                break;
            }
        }

        if (!lastRedoId) return false;

        const strokeToRedo = this.redoStack.filter(line => line.strokeId === lastRedoId);
        this.history.push(...strokeToRedo);
        this.redoStack = this.redoStack.filter(line => line.strokeId !== lastRedoId);
        return true;
    }

    get() { return this.history; }

    clear() {
        this.history = [];
        this.redoStack = [];
    }
}