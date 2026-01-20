export class DrawingState {
    constructor() {
        this.history = [];
    }

    add(line, userId) {
        // line now includes {startX, startY, endX, endY, color, width, strokeId}
        this.history.push({ ...line, userId });
    }

    undo(userId) {
        // 1. Find the strokeId of the very last segment drawn by this user
        let lastStrokeId = null;
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].userId === userId) {
                lastStrokeId = this.history[i].strokeId;
                break;
            }
        }

        if (!lastStrokeId) return false;

        // 2. Remove every segment that belongs to that stroke
        const initialCount = this.history.length;
        this.history = this.history.filter(line => line.strokeId !== lastStrokeId);
        
        console.log(`Undo: Removed ${initialCount - this.history.length} segments for stroke ${lastStrokeId}`);
        return true;
    }

    get() {
        return this.history;
    }

    clear() {
        this.history = [];
    }
}