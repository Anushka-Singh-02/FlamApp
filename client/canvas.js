export class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.color = '#000000';
        this.lineWidth = 5;
        this.isEraser = false;
        
        this.setupCanvas();
        // Handle window resizing
        window.addEventListener('resize', () => this.setupCanvas());
    }

    // Inside client/canvas.js -> setupCanvas()
setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // 1. Force the canvas element to fill the window
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 2. Set the internal drawing buffer (the high-res size)
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    // 3. Set the CSS display size (the "viewing" size)
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // 4. Scale the context so our coordinates match the CSS pixels
    this.ctx.scale(dpr, dpr);

    // 5. Re-apply styles (Canvas resets these when width/height change)
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
}
    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
    }

    draw(x, y) {
        if (!this.isDrawing) return null;

        const lineData = {
            startX: this.lastX,
            startY: this.lastY,
            endX: x,
            endY: y,
            color: this.color,
            width: this.lineWidth,
            isEraser: this.isEraser
        };

        this.renderLine(lineData);

        this.lastX = x;
        this.lastY = y;
        return lineData;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    // Single source of truth for painting a line segment
    renderLine(data) {
        this.ctx.beginPath();
        this.ctx.lineWidth = data.width;
        
        if (data.isEraser) {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
        }

        this.ctx.moveTo(data.startX, data.startY);
        this.ctx.lineTo(data.endX, data.endY);
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Always reset to default
        this.ctx.globalCompositeOperation = 'source-over';
    }

    redrawHistory(history) {
        this.clear();
        history.forEach(line => this.renderLine(line));
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}