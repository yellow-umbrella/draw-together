let socket;
let canvas;
let colorPicker;
let widthSlider;

function setup() {
    canvas = createCanvas(700, 700);
    background(51);
    
    colorPicker = document.getElementById('colorPicker');
    widthSlider = document.getElementById('widthSlider');

    socket = io.connect(window.location.host);
    socket.on('mouse', newDrawing);

    let path = window.location.pathname;
    if (path.length > 0) {
        path = path.slice(1);
    }
    socket.emit('room', path);
    socket.on('path', (data) => {
        window.history.pushState({}, "", 
        window.location.protocol + '//' + window.location.host + data);
    })
    socket.on('canvas', (lines) => {
        console.log("recieved lines");
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
        color: colorPicker.value,
        width: widthSlider.value,
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
    stroke(data.color);
    strokeWeight(data.width);
    line(data.start.x, data.start.y, data.end.x, data.end.y); 
}