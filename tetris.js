// Constants
const PLAYFIELD_WIDTH = 10;
const PLAYFIELD_HEIGHT = 20;
const BLOCK_SIZE = 30;
const PLAYFIELD_X = 50;
const PLAYFIELD_Y = 50;

// Set up the canvas
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Set up the playfield
const playfield = [];
for (let row = 0; row < PLAYFIELD_HEIGHT; row++) {
    playfield[row] = [];
    for (let col = 0; col < PLAYFIELD_WIDTH; col++) {
        playfield[row][col] = 0;
    }
}

canvas.width = PLAYFIELD_X * 2 + BLOCK_SIZE * PLAYFIELD_WIDTH;
canvas.height = PLAYFIELD_Y * 2 + BLOCK_SIZE * PLAYFIELD_HEIGHT;

// Draw a single cell of the playfield or the tetromino
function drawCell(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = 'white';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the playfield and the tetromino
function draw() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the playfield
    for (let row = 0; row < PLAYFIELD_HEIGHT; row++) {
        for (let col = 0; col < PLAYFIELD_WIDTH; col++) {
            if (playfield[row][col]) {
                drawCell(col, row, playfield[row][col]);
            }
        }
    }

    // Draw the tetromino
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (currentTetromino[row][col]) {
                drawCell(currentTetrominoX + col, currentTetrominoY + row, currentTetrominoColor);
            }
        }
    }

    // Draw the score
    context.font = '20px Arial';
    context.fillStyle = 'white';
    context.fillText(`Score: ${score}`, 20, 30);
}

// Tetrominoes
const tetrominoes = [
    // I
    [[1, 1, 1, 1]],

    // J
    [[1, 0, 0], [1, 1, 1]],

    // L
    [[0, 0, 1], [1, 1, 1]],

    // O
    [[1, 1], [1, 1]],

    // S
    [[0, 1, 1], [1, 1, 0]],

    // T
    [[0, 1, 0], [1, 1, 1]],

    // Z
    [[1, 1, 0], [0, 1, 1]]
];

// Colors
const colors = [
    '#00ffff', // I
    '#0000ff', // J
    '#ff8c00', // L
    '#ffff00', // O
    '#00ff00', // S
    '#8b00ff', // T
    '#ff0000' // Z
];

// Random tetromino
function randomTetromino() {
    const tetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
    const tetromino = tetrominoes[tetrominoIndex];
    const tetrominoColor = colors[tetrominoIndex];
    return { tetromino, tetrominoColor };
}

// Current tetromino
let currentTetromino = randomTetromino();
let currentTetrominoX = 3;
let currentTetrominoY = 0;

// Score
let score = 0;

// Keyboard controls
document.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case 37: // Left arrow
            moveTetromino(-1);
            break;
        case 38: // Up arrow
            rotateTetromino();
            break;
        case 39: // Right arrow
            moveTetromino(1);
            break;
        case 40: // Down arrow
            dropTetromino();
            break;
    }
});

// Move tetromino left or right
function moveTetromino(direction) {
    const newX = currentTetrominoX + direction;
    if (canMoveTo(newX, currentTetrominoY, currentTetromino)) {
        currentTetrominoX = newX;
        draw();
    }
}

// Rotate tetromino
function rotateTetromino() {
    const newTetromino = rotate(currentTetromino);
    if (canMoveTo(currentTetrominoX, currentTetrominoY, newTetromino)) {
        currentTetromino = newTetromino;
        draw();
    }
}

// Drop tetromino to the bottom
function dropTetromino() {
    while (canMoveTo(currentTetrominoX, currentTetrominoY + 1, currentTetromino)) {
        currentTetrominoY++;
    }
    placeTetromino();
}

// Place tetromino on the playfield
function placeTetromino() {
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (currentTetromino[row][col]) {
                playfield[currentTetrominoY + row][currentTetrominoX + col] = currentTetrominoColor;
            }
        }
    }

    // Check for lines to clear
    for (let row = 0; row < PLAYFIELD_HEIGHT; row++) {
        if (playfield[row].every(cell => cell)) {
            playfield.splice(row, 1);
            playfield.unshift(Array(PLAYFIELD_WIDTH).fill(0));
            score += 10;
        }
    }

    currentTetromino = randomTetromino();
    currentTetrominoX = 3;
    currentTetrominoY = 0;

    if (!canMoveTo(currentTetrominoX, currentTetrominoY, currentTetromino)) {
        gameOver();
    }

    draw();
}

// Check if the tetromino can move to the new position
function canMoveTo(newX, newY, tetromino) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
                const playfieldX = newX + col;
                const playfieldY = newY + row;
                if (playfieldX < 0 || playfieldX >= PLAYFIELD_WIDTH || playfieldY >= PLAYFIELD_HEIGHT || playfield[playfieldY][playfieldX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    context.font = '30px Arial';
    context.fillStyle = 'red';
    context.fillText('Game Over', 100, 200);
}

// Start the game
let gameInterval = setInterval(() => {
    if (canMoveTo(currentTetrominoX, currentTetrominoY + 1, currentTetromino)) {
        currentTetrominoY++;
        draw();
    } else {
        placeTetromino();
    }
}, 1000);

// Draw the initial playfield and tetromino
draw();