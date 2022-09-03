let socket;

function setup() {
    createCanvas(200, 200);
    background(51); 

    socket = io.connect('http://localhost:3000');
    socket.on('mouse', newDrawing);
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