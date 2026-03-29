const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        socket.join(data.room);
        if(!rooms[data.room]) rooms[data.room] = {};
        rooms[data.room][socket.id] = { name: data.name, x:0, y:0, z:0, ry:0 };
        io.to(data.room).emit('playerUpdate', rooms[data.room]);
    });

    socket.on('move', (data) => {
        if(rooms[data.room] && rooms[data.room][socket.id]) {
            rooms[data.room][socket.id] = { ...rooms[data.room][socket.id], ...data };
            socket.to(data.room).emit('playerUpdate', rooms[data.room]);
        }
    });

    socket.on('disconnect', () => {
        for(let r in rooms) {
            if(rooms[r][socket.id]) {
                delete rooms[r][socket.id];
                io.to(r).emit('removePlayer', socket.id);
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => console.log("Server Running"));
