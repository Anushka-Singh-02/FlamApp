import { CanvasManager } from './canvas.js';
const socket = io();
const canvas = document.getElementById('canvas');
const manager = new CanvasManager(canvas);
let currentStrokeId = null;

canvas.addEventListener('mousedown', e => {
    currentStrokeId = `${socket.id}-${Date.now()}`;
    manager.startDrawing(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
    const line = manager.draw(e.offsetX, e.offsetY);
    if (line && currentStrokeId) socket.emit('draw', { ...line, strokeId: currentStrokeId });
    socket.emit('mouse-move', { x: e.offsetX, y: e.offsetY });
});

window.addEventListener('mouseup', () => { manager.isDrawing = false; currentStrokeId = null; });

// UI Handlers
document.getElementById('brushBtn').onclick = () => { manager.isEraser = false; toggleActive('brushBtn'); };
document.getElementById('eraserBtn').onclick = () => { manager.isEraser = true; toggleActive('eraserBtn'); };
document.getElementById('colorPicker').onchange = e => manager.color = e.target.value;
document.getElementById('brushSize').oninput = e => manager.lineWidth = e.target.value;
document.getElementById('undoBtn').onclick = () => socket.emit('undo');
document.getElementById('redoBtn').onclick = () => socket.emit('redo');
document.getElementById('clearBtn').onclick = () => socket.emit('clear');

function toggleActive(id) {
    ['brushBtn', 'eraserBtn'].forEach(btn => document.getElementById(btn).classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

const usersPanel = document.getElementById('usersPanel');
const usersList = document.getElementById('usersList');
const usersBtn = document.getElementById('usersBtn');
const closeUsersBtn = document.getElementById('closeUsersBtn');

usersBtn.onclick = () => usersPanel.classList.toggle('hidden');
closeUsersBtn.onclick = () => usersPanel.classList.add('hidden');

const connectedUsers = {};

socket.on('user-joined', (data) => {
    connectedUsers[data.id] = data.name || `User ${data.id.substring(0, 4)}`;
    updateUsersList();
});

socket.on('user-left', (id) => {
    delete connectedUsers[id];
    updateUsersList();
});

function updateUsersList() {
    usersList.innerHTML = '';
    Object.entries(connectedUsers).forEach(([id, name]) => {
        const li = document.createElement('li');
        const dot = document.createElement('div');
        dot.className = 'user-dot';
        const hue = Math.abs(id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360;
        dot.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
        
        const text = document.createElement('span');
        text.textContent = name;
        
        li.appendChild(dot);
        li.appendChild(text);
        usersList.appendChild(li);
    });
}

socket.on('init', history => manager.redrawHistory(history));
socket.on('draw', data => manager.renderLine(data));
socket.on('clear', () => manager.clear());

const cursors = {};
let lastMoveEmit = 0;

socket.on('mouse-move', (data) => {
    // 1. Create cursor if it doesn't exist
    if (!cursors[data.id]) {
        console.log("Creating new cursor for user:", data.id);
        
        const dot = document.createElement('div');
        dot.className = 'cursor';
        
        // Color logic
        const hue = Math.abs(data.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360;
        const color = `hsl(${hue}, 70%, 50%)`;
        dot.style.backgroundColor = color;

        // 2. Create the Name Tag
        const nameTag = document.createElement('div');
        nameTag.className = 'cursor-name';
        nameTag.style.backgroundColor = color;
        nameTag.style.color = 'black'; // Ensure text is visible
        nameTag.innerText = `User ${data.id.substring(0, 4)}`;
        
        // 3. ATTACHMENT (Crucial Step)
        dot.appendChild(nameTag); // Put name inside the dot
        document.body.appendChild(dot); // Put dot on the page
        
        cursors[data.id] = dot;
    }

    // 4. Update position
    const rect = canvas.getBoundingClientRect();
    const x = data.x + rect.left;
    const y = data.y + rect.top;

    cursors[data.id].style.left = `${x}px`;
    cursors[data.id].style.top = `${y}px`;
});

// Remove cursor when user leaves
socket.on('user-left', (id) => {
    if (cursors[id]) {
        cursors[id].remove();
        delete cursors[id];
    }
});

canvas.addEventListener('mousemove', e => {
    const line = manager.draw(e.offsetX, e.offsetY);
    if (line && currentStrokeId) {
        socket.emit('draw', { ...line, strokeId: currentStrokeId });
    }

    // Throttle: Only send cursor position every 30ms (prevents lag)
    if (Date.now() - lastMoveEmit > 30) {
        socket.emit('mouse-move', { x: e.offsetX, y: e.offsetY });
        lastMoveEmit = Date.now();
    }
});