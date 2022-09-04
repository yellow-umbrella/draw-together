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

let crypto = require("crypto");


const rooms = new Map();

function newConnection(socket) {
    let roomId = socket.id;
    console.log('new connection: ' + socket.id);

    socket.on('room', (data) => {
        if (!rooms.has(data)) {
            roomId = crypto.randomBytes(9).toString('base64');
            rooms.set(roomId, {
                users: new Set([socket.id]),
                lines: new Array()
            });
            socket.join(roomId);
            socket.emit('path', "/" + roomId);
            console.log(socket.id + " connected to " + roomId 
            + " with " + rooms.get(roomId).users.size + " users");
        } else {
            roomId = data;
            rooms.get(roomId).users.add(socket.id);
            socket.join(roomId);
            console.log(socket.id + " connected to " + roomId 
            + " with " + rooms.get(roomId).users.size + " users");
            socket.emit('canvas', rooms.get(roomId).lines);
            console.log('sent lines');
        }
        console.log('rooms: ' + rooms.size);
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

    // receiving info about new line from client and sending it to all other clients
    socket.on('mouse', (data) => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).lines.push(data);
        }
        socket.to(roomId).emit("mouse", data);
    });

}
