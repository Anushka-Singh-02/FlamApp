export class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.color = '#000000';
        this.lineWidth = 5;
        this.isEraser = false;
        this.setupCanvas();
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(dpr, dpr);
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
        const line = { startX: this.lastX, startY: this.lastY, endX: x, endY: y, 
                     color: this.color, width: this.lineWidth, isEraser: this.isEraser };
        this.renderLine(line);
        this.lastX = x; this.lastY = y;
        return line;
    }

    renderLine(data) {
        this.ctx.beginPath();
        this.ctx.lineWidth = data.width;
        this.ctx.globalCompositeOperation = data.isEraser ? 'destination-out' : 'source-over';
        this.ctx.strokeStyle = data.color;
        this.ctx.moveTo(data.startX, data.startY);
        this.ctx.lineTo(data.endX, data.endY);
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
    }

    redrawHistory(history) {
        this.clear();
        history.forEach(line => this.renderLine(line));
    }

    clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
}