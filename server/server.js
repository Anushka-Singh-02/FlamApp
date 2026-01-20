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
    socket.emit('init', state.get());
    io.emit('user-joined', { id: socket.id, name: `User ${socket.id.substring(0, 4)}` });
    io.emit('user-count', io.engine.clientsCount);

    socket.on('draw', (data) => {
        state.add(data, socket.id);
        socket.broadcast.emit('draw', data);
    });

    socket.on('mouse-move', (data) => {
        socket.broadcast.emit('mouse-move', { id: socket.id, ...data });
    });

    socket.on('undo', () => {
        if (state.undo(socket.id)) io.emit('init', state.get());
    });

    socket.on('redo', () => {
        const success = state.redo(socket.id);
        if (success) {
            io.emit('init', state.get()); 
        }
    });

    socket.on('clear', () => {
        state.clear();
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        io.emit('user-left', socket.id);
        io.emit('user-count', io.engine.clientsCount);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));