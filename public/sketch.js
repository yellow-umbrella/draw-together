var socket;

function setup() {
    createCanvas(200, 200);

    socket = io.connect('http://localhost:3000');
    background(51); 
}

function draw() {
    if (mouseIsPressed) {
        noStroke();
        circle(mouseX, mouseY, 5);
    } 
}