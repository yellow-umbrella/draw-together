let socket;
let UI = {};
let picture = {};

function setup() {
    initUI();
    initPicture();
    initSockets();
}

function initPicture() {
    picture.canvas = createCanvas(1000, 560);
    picture.canvas.style('border', '3px solid #000000');
    picture.prevCoord = null;
    background(UI.backgroundClrPicker.value);
}

function initUI() {
    UI.backgroundClrPicker = document.getElementById('backgroundColor');
    UI.brushClrPicker = document.getElementById('colorPicker');
    UI.widthSlider = document.getElementById('widthSlider');
    UI.clearAllButton = document.getElementById('clearAll');
    UI.brush = document.getElementById('brush');
    UI.clearAllButton.onclick = clearAll;
    UI.backgroundClrPicker.addEventListener('change', updateBackground, false);
}

function initSockets() {
    socket = io.connect(window.location.host);
    let path = processPath();

    socket.on('draw', newDrawing);

    socket.on('path', (data) => {
        updatePath(data);
    });

    socket.on('canvas', (data) => {
        changeBackground(data);
        redrawLines(data);
    });

    socket.on('clearAll', () => {
        background(UI.backgroundClrPicker.value);
    });
}

function clearAll() {
    background(UI.backgroundClrPicker.value);
    socket.emit('clearAll');
}

function updateBackground() {
    socket.emit('background', UI.backgroundClrPicker.value);
}

function mouseReleased() {
    picture.prevCoord = null;
}

function mouseDragged() {
    // save the coordinates when user starts to draw
    if (picture.prevCoord === null) {
        picture.prevCoord = {
            x: mouseX,
            y: mouseY,
        };
    }

    let data = {
        color: UI.brush.checked ? UI.brushClrPicker.value : null,
        width: widthSlider.value,
        start: {
            x: picture.prevCoord.x,
            y: picture.prevCoord.y,
        },
        end: {
            x: mouseX,
            y: mouseY,
        },
    };

    socket.emit('draw', data);

    picture.prevCoord = {
        x: mouseX,
        y: mouseY,
    };
}

function newDrawing(data) {
    if (data.color === null) {
        stroke(UI.backgroundClrPicker.value);
    } else {
        stroke(data.color);
    }

    strokeWeight(data.width);
    line(data.start.x, data.start.y, data.end.x, data.end.y);
}

function changeBackground(data) {
    if (data.background != null) {
        background(data.background);
        UI.backgroundClrPicker.value = data.background;
    }
}

function redrawLines(data) {
    data.lines.forEach((line) => {
        newDrawing(line);
    });
}

function updatePath(data) {
    let url = `${window.location.protocol}//${window.location.host}${data}`;
    window.history.pushState({}, '', url);
}

function processPath() {
    let path = window.location.pathname;
    if (path.length > 0) {
        path = path.slice(1);
    }
    socket.emit('room', path);
    return path;
}

function saveImage() {
    saveCanvas(picture.canvas, 'My_beautiful_drawing', 'jpg');
}
