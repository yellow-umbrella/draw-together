let socket;
let UI = {};
let picture = {};

function setup() {
    initPicture();
    initUI();
    initSockets();
}

function initPicture() {
    picture.canvas = createCanvas(700, 700);
    picture.background = 51;
    background(picture.background);
    picture.prevCoord = null;
}

function initUI() {
    UI.colorPicker = document.getElementById('colorPicker');
    UI.widthSlider = document.getElementById('widthSlider');
    UI.clearAllButton = document.getElementById('clearAll');
    UI.brush = document.getElementById('brush');
    UI.clearAllButton.onclick = clearAll;
}

function initSockets() {
    socket = io.connect(window.location.host);
    socket.on('draw', newDrawing);

    let path = window.location.pathname;
    if (path.length > 0) {
        path = path.slice(1);
    }
    socket.emit('room', path);

    socket.on('path', (data) => {
        window.history.pushState({}, "", 
        window.location.protocol + '//' + window.location.host + data);
    });

    socket.on('canvas', (lines) => {
        console.log("recieved lines");
        lines.forEach(line => {
            newDrawing(line);
        });
    });

    socket.on('clearAll', () => {
        background(picture.background);
    })
}

function clearAll() {
    background(picture.background);
    socket.emit('clearAll');
}

function mouseReleased() {
    picture.prevCoord = null;
}

function mouseDragged() {
    // save the coordinates when user starts to draw
    if (picture.prevCoord === null) {
        picture.prevCoord = {
            x: mouseX,
            y: mouseY
        }
    }

    let data = {
        color: UI.brush.checked?colorPicker.value:null,
        width: widthSlider.value,
        start: {
            x: picture.prevCoord.x,
            y: picture.prevCoord.y
        },
        end: {
            x: mouseX,
            y: mouseY
        }
    }
    
    newDrawing(data);
    socket.emit('draw', data);

    picture.prevCoord = {
        x: mouseX,
        y: mouseY
    }
}

function newDrawing(data) {
    if (data.color === null) {
        stroke(picture.background);
    } else {
        stroke(data.color);
    }
    strokeWeight(data.width);
    line(data.start.x, data.start.y, data.end.x, data.end.y); 
}