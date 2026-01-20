import { CanvasManager } from './canvas.js';

const socket = io();
const canvas = document.getElementById('canvas');
const manager = new CanvasManager(canvas);
const cursors = {};

let currentStrokeId = null;

// --- TOOL SELECTION ---
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');

brushBtn.onclick = () => {
    manager.isEraser = false;
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
};

eraserBtn.onclick = () => {
    manager.isEraser = true;
    eraserBtn.classList.add('active');
    brushBtn.classList.remove('active');
};

colorPicker.onchange = (e) => manager.color = e.target.value;
brushSize.oninput = (e) => manager.lineWidth = e.target.value;

// --- MOUSE EVENTS ---
canvas.addEventListener('mousedown', e => {
    // Unique ID for the entire continuous stroke
    currentStrokeId = `${socket.id}-${Date.now()}`;
    manager.startDrawing(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
    const line = manager.draw(e.offsetX, e.offsetY);
    
    if (line && currentStrokeId) {
        // Emit drawing data with strokeId for grouped undo
        socket.emit('draw', { ...line, strokeId: currentStrokeId });
    }
    
    // Emit cursor position
    socket.emit('mouse-move', { x: e.offsetX, y: e.offsetY });
});

window.addEventListener('mouseup', () => {
    manager.stopDrawing();
    currentStrokeId = null;
});

// Toolbar Actions
document.getElementById('clearBtn').onclick = () => socket.emit('clear');
document.getElementById('undoBtn').onclick = () => socket.emit('undo');

// --- SOCKET EVENTS ---

// Initial load or full refresh (after Undo)
socket.on('init', (history) => {
    manager.redrawHistory(history);
});

// Real-time draw from other users
socket.on('draw', (data) => {
    manager.renderLine(data);
});

socket.on('clear', () => {
    manager.clear();
});

// Cursor Tracking
socket.on('mouse-move', (data) => {
    if (!cursors[data.id]) {
        const el = document.createElement('div');
        el.className = 'cursor';
        // Random color for each user's cursor
        el.style.background = `hsl(${parseInt(data.id, 36) % 360}, 70%, 50%)`;
        document.body.appendChild(el);
        cursors[data.id] = el;
    }
    
    // Adjust position based on canvas offset
    const rect = canvas.getBoundingClientRect();
    cursors[data.id].style.left = `${data.x + rect.left}px`;
    cursors[data.id].style.top = `${data.y + rect.top}px`;
});

socket.on('user-left', (id) => {
    if (cursors[id]) {
        cursors[id].remove();
        delete cursors[id];
    }
});