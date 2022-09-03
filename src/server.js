let express = require('express');
let app = express();
let server = app.listen(3000);
app.use(express.static('public'));

let socket = require('socket.io');
let io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    // receiving info about new line from client and sending it to all other clients
    socket.on('mouse', (data) => {
        socket.broadcast.emit("mouse", data);
    });
}
