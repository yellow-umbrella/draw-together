let path = require('path');
let express = require('express');
let app = express();
let server = app.listen(3000);
app.use(express.static('public'));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

let socket = require('socket.io');
let io = socket(server);
io.sockets.on('connection', newConnection);

const rooms = new Map();

function newConnection(socket) {
    let roomId = socket.id;

    socket.on('room', (data) => {
        if (!rooms.has(data)) {
            roomId = socket.id;
            rooms.set(roomId, {
                users: new Set([socket.id]),
                lines: new Array()
            });
            socket.emit('path', "/" + roomId);
        } else {
            roomId = data;
            rooms.get(roomId).users.add(socket.id);
            socket.join(roomId);
            socket.emit('canvas', rooms.get(roomId).lines);
        }
    });

    socket.on('disconnecting', () => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).users.delete(socket.id);
            if (rooms.get(roomId).users.size == 0) {
                rooms.delete(roomId);
                console.log('close room ' + roomId);
            }
        }
        console.log('rooms: ' + rooms.size);
    });

    console.log('new connection: ' + socket.id + ' ' + roomId);
    // receiving info about new line from client and sending it to all other clients
    socket.on('mouse', (data) => {
        rooms.get(roomId).lines.push(data);
        socket.to(roomId).emit("mouse", data);
    });

    console.log('rooms: ' + rooms.size);
}
