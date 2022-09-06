let path = require('path');
let express = require('express');
let app = express();
let server = app.listen(process.env.PORT || 3000);
app.use(express.static('public'));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

let socket = require('socket.io');
let io = socket(server);
io.sockets.on('connection', newConnection);

let crypto = require('crypto');

const rooms = new Map();

const timeToClose = 1000 * 60 * 60; // 1 hour in milliseconds

function newConnection(socket) {
    let roomId = socket.id;
    console.log('new connection:', socket.id);

    socket.on('room', (data) => {
        if (!rooms.has(data)) {
            roomId = crypto.randomBytes(9).toString('base64');
            rooms.set(roomId, {
                users: new Set([socket.id]),
                lines: new Array(),
                background: null,
                timeout: null,
            });
            socket.join(roomId);
            socket.emit('path', '/' + roomId);
            console.log(
                socket.id,
                'connected to',
                roomId,
                'with',
                rooms.get(roomId).users.size,
                'users'
            );
        } else {
            roomId = data;
            rooms.get(roomId).users.add(socket.id);
            if (rooms.get(roomId).timeout != null) {
                clearTimeout(rooms.get(roomId).timeout);
                rooms.get(roomId).timeout = null;
            }
            socket.join(roomId);
            console.log(
                socket.id,
                'connected to',
                roomId,
                'with',
                rooms.get(roomId).users.size,
                'users'
            );
            socket.emit('canvas', {
                lines: rooms.get(roomId).lines,
                background: rooms.get(roomId).background,
            });
            console.log('sent lines');
        }
        console.log('rooms: ' + rooms.size);
    });

    socket.on('disconnecting', () => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).users.delete(socket.id);
            if (rooms.get(roomId).users.size == 0) {
                console.log('closing room', roomId);
                rooms.get(roomId).timeout = setTimeout(
                    deleteRoom,
                    timeToClose,
                    roomId
                );
            }
        }
    });

    // receiving info about new line from client and sending it to all other clients
    socket.on('draw', (data) => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).lines.push(data);
        }
        io.to(roomId).emit('draw', data);
    });

    socket.on('clearAll', () => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).lines = [];
        }
        socket.to(roomId).emit('clearAll');
    });

    socket.on('background', (data) => {
        console.log('background changed');
        if (rooms.has(roomId)) {
            rooms.get(roomId).background = data;
        }
        io.to(roomId).emit('canvas', {
            lines: rooms.get(roomId).lines,
            background: data,
        });
    });
}

function deleteRoom(roomId) {
    if (rooms.has(roomId)) {
        rooms.delete(roomId);
        console.log('close room', roomId);
        console.log('rooms:', rooms.size);
    }
}
