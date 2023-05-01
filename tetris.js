const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const newGameButton = document.getElementById('new-game');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

const speed = 1000; // milliseconds

let score = 0;

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = ROWS * BLOCK_SIZE;

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT;

const board = [];
for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
        board[row][col] = 0;
    }
}

function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = 'black';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

const colors = [
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
];

const tetrominoes = [
    [   // I
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [   // J
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [   // L
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [   // O
        [1, 1],
        [1, 1]
    ],
    [   // S
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [   // T
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [   // Z
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
];

function randomPiece() {
    const r = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[r];
}

let currentPiece = randomPiece();
let currentX = 3;
let currentY = -2;

function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(col, row, colors[board[row][col] - 1]);
            }
        }
    }
}

function drawPiece(piece, x, y) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                drawBlock(x + col, y + row, colors[piece[row][col] - 1]);
            }
        }
    }
}

function erasePiece(piece, x, y) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < currentTetromino[0].length; col++) {
            if (currentTetromino[row][col]) {
                drawSquare(x + col, y + row, currentTetrominoColor);
            }
        }
    }
}

// Move the tetromino down by one square every 'speed' milliseconds
let dropStart = Date.now();
let gameOver = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > speed) {
        moveTetrominoDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

// Start the game
document.addEventListener('keydown', handleKeyPress);
newGameButton.addEventListener('click', startNewGame);
drawBoard();
drawScoreDisplay();
drawGameOverMessage();
startNewGame();

function startNewGame() {
    gameOver = false;
    board.forEach(row => row.fill(0));
    currentPiece = randomPiece();
    currentX = 3;
    currentY = -2;
    drawBoard();
    drawPiece(currentPiece, currentX, currentY);
    drop();
}

function handleKeyPress(event) {
    if (gameOver) {
        return;
    }
    if (event.keyCode === 37) {
        moveTetrominoLeft();
    } else if (event.keyCode === 39) {
        moveTetrominoRight();
    } else if (event.keyCode === 40) {
        moveTetrominoDown();
    } else if (event.keyCode === 38) {
        rotateTetromino();
    }
}

function moveTetrominoLeft() {
    if (!collision(-1, 0, currentPiece)) {
        erasePiece(currentPiece, currentX, currentY);
        currentX--;
        drawPiece(currentPiece, currentX, currentY);
    }
}

function moveTetrominoRight() {
    if (!collision(1, 0, currentPiece)) {
        erasePiece(currentPiece, currentX, currentY);
        currentX++;
        drawPiece(currentPiece, currentX, currentY);
    }
}

function moveTetrominoDown() {
    if (collision(0, 1, currentPiece)) {
        lockPiece();
        currentPiece = randomPiece();
        currentX = 3;
        currentY = -2;
    } else {
        erasePiece(currentPiece, currentX, currentY);
        currentY++;
        drawPiece(currentPiece, currentX, currentY);
    }
}

function rotateTetromino() {
    let rotatedPiece = rotate(currentPiece);
    if (!collision(0, 0, rotatedPiece)) {
        erasePiece(currentPiece, currentX, currentY);
        currentPiece = rotatedPiece;
        drawPiece(currentPiece, currentX, currentY);
    }
}

function rotate(piece) {
    let rotatedPiece = [];
    for (let row = 0; row < piece.length; row++) {
        rotatedPiece[row] = [];
        for (let col = 0; col < piece[row].length; col++) {
            rotatedPiece[row][col] = piece[col][row];
        }
    }
    rotatedPiece.forEach(row => row.reverse());
    return rotatedPiece;
}

function collision(x, y, piece) {
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (!piece[row][col]) {
                continue;
            }
            let newX = currentX + col + x;
            let newY = currentY + row + y;
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            if (board[newY][newX]) {
                return true;
            }
        }
    }
    return false;
}

function lockPiece() {
    for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
            if (!currentPiece[row][col]) {
                continue;
            }
            let newX = currentX + col;
            let newY = currentY + row;
            board[newY][newX] = currentPiece[row][col];
        }
    }
    checkForCompletedRows();
    drawBoard();
    drawPiece(currentPiece, currentX, currentY);
}

function checkForCompletedRows() {
    let rowsCompleted = 0;
    for (let row = 0; row < ROWS; row++) {
        if (board[row].every(cell => cell)) {
            rowsCompleted++;
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
    if (rowsCompleted) {
        updateScore(rowsCompleted);
    }
}

function updateScore(rowsCompleted) {
    score += rowsCompleted * 10;
    drawScoreDisplay();
}

function drawScoreDisplay() {
    scoreDisplay.textContent = score;
}

function drawGameOverMessage() {
    gameOverMessage.textContent = 'Game Over';
}

currentTetromino = randomPiece();
currentTetrominoColor = colors[currentTetromino[0][0] - 1];

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

function moveTetrominoDown() {
    if (collision(0, 1, currentTetromino)) {
        lockPiece();
        currentTetromino = randomPiece();
        currentTetrominoColor = colors[currentTetromino[0][0] - 1];
        currentX = 3;
        currentY = -2;
    } else {
        erasePiece(currentTetromino, currentX, currentY);
        currentY++;
        drawPiece(currentTetromino, currentX, currentY);
    }
}

function erasePiece() {
    for (let row = 0; row < currentTetromino.length; row++) {
        for (let col = 0; col < currentTetromino[row].length; col++) {
            if (!currentTetromino[row][col]) {
                continue;
            }
            drawSquare(currentX + col, currentY + row, 'white');
        }
    }
}

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}