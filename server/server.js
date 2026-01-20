import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DrawingState } from './drawing-state.js';

const app = express();
const server = createServer(app);
const io = new Server(server);
const state = new DrawingState();

app.use(express.static('client'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // 1. Send existing history to the new user
    socket.emit('init', state.get());

    // 2. Handle drawing (FIXED: added socket.id)
    socket.on('draw', (data) => {
        state.add(data, socket.id); 
        socket.broadcast.emit('draw', data);
    });

    // 3. Handle cursors
    socket.on('mouse-move', (data) => {
        socket.broadcast.emit('mouse-move', { id: socket.id, ...data });
    });

    // 4. Handle Undo
    socket.on('undo', () => {
        const success = state.undo(socket.id);
        console.log('Undo requested by:', socket.id, 'Success:', success);
        if (success) {
            io.emit('init', state.get()); 
        }
    });

    // 5. Handle Clear
    socket.on('clear', () => {
        state.clear();
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        io.emit('user-left', socket.id);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));