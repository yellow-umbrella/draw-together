let socket;

function setup() {
    createCanvas(700, 700);
    background(51);

    socket = io.connect('0.0.0.0:3000');
    socket.on('mouse', newDrawing);

    let path = window.location.pathname;
    if (path.length > 0) {
        path = path.slice(1);
    }
    socket.emit('room', path);
    socket.on('path', (data) => {
        window.location.pathname = data;
    })
    socket.on('canvas', (lines) => {
        lines.forEach(line => {
            newDrawing(line);
        });
    })
}

let prevCoord = null;

function mouseReleased() {
    prevCoord = null;
}

function mouseDragged() {
    // save the coordinates when user starts to draw
    if (prevCoord === null) {
        prevCoord = {
            x: mouseX,
            y: mouseY
        }
    }

    let data = {
        start: {
            x: prevCoord.x,
            y: prevCoord.y
        },
        end: {
            x: mouseX,
            y: mouseY
        }
    }
    
    newDrawing(data);
    socket.emit('mouse', data);

    prevCoord = {
        x: mouseX,
        y: mouseY
    }
}

function newDrawing(data) {
    stroke(255);
    strokeWeight(5);
    line(data.start.x, data.start.y, data.end.x, data.end.y); 
}