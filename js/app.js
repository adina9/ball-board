var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GLUE_IMG = '<img src ="img/candy.png"/>';
var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var gShuffledArr;
var gEmptyCells;
var gCounter = 0;
var gCounterBallsOnBoard = 0;
var gInterval;
var gGameOn = false;
var isGlue = false;
var gGlueInterval;


function initGame() {
    gGameOn = true;
    gGamerPos = { i: 2, j: 9 };
    gBoard = buildBoard();
    renderBoard(gBoard);
    addBalls();
    addGlue();
}

function findEmptyCells() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.gameElement === null && currCell.type === FLOOR) {
                var pos = { i, j }
                emptyCells.push(pos)
            }
        }
    }
    return emptyCells
}

function createShuffledArr(array) {
    var copyArray = array.slice()
    var shuffledArr = [];
    for (var i = 0; i < array.length; i++) {
        shuffledArr[i] = copyArray.splice(getRandomInt(0, copyArray.length), 1)[0]
    }
    return shuffledArr;
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function addABall() {
    gEmptyCells = findEmptyCells();
    // console.log(gEmptyCells);
    gShuffledArr = createShuffledArr(gEmptyCells);
    // console.log(gShuffledArr);

    var randomBallPos = gShuffledArr.pop();
    console.log('ballPos', randomBallPos);

    gBoard[randomBallPos.i][randomBallPos.j].gameElement = BALL;
    renderCell(randomBallPos, BALL_IMG)
}

function addBalls() {
    gInterval = setInterval(addABall, 5000)
    gCounterBallsOnBoard++;

}

function putGlue() {
    gEmptyCells = findEmptyCells();
    gShuffledArr = createShuffledArr(gEmptyCells);
    var randomBallPos = gShuffledArr.pop();
    gBoard[randomBallPos.i][randomBallPos.j].gameElement = GLUE;
    renderCell(randomBallPos, GLUE_IMG)
    setTimeout(function() {
        if (gBoard[i][j] === GAMER) return
        gBoard[i][j].gameElement = null;
        renderCell({ i, j }, '')
    }, 3000)
}

function addGlue() {
    gGlueInterval = setInterval(putGlue, 5000);
}

function removeGlue() {
    isGlue = false;
    gGlueInterval = setTimeout(3000, renderCell(randomBallPos, ''));
}

function playSound() {
    var sound = new Audio('ballpicked.wav');
    sound.play();
}

function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)


    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }
            if (i === 0 && j === 5 || i === 9 && j === 5 ||
                i === 5 && j === 0 || i === 5 && j === 11) {
                cell.type = FLOOR;
            }

            // Add created cell to The game board
            board[i][j] = cell;
        }
    }

    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL;
    board[7][4].gameElement = BALL;

    console.table(board);
    return board;
}

// Render the board to an HTML table
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i, j })

            // TODO - change to short if statement
            cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

            //TODO - Change To template string
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // TODO - change to switch case statement
            switch (currCell.gameElement) {
                case GAMER:
                    strHTML += GAMER_IMG;
                    break;
                case BALL:
                    strHTML += BALL_IMG;
                    break;
                case GLUE:
                    strHTML += GLUE_IMG;
                    break;
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
    // gCounter = 0;
    if (!gGameOn) return
    if (isGlue) return
    if (i === -1) i = 9;
    if (i === 10) i = 0;
    if (j === -1) j = 11;
    if (j === 12) j = 0;

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;
    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0) ||
        (iAbsDiff === 9 && jAbsDiff === 0) ||
        (iAbsDiff === 0 && jAbsDiff === 11)) {


        if (targetCell.gameElement === BALL) {
            playSound();
            if (gCounter < 10) {
                gCounter++;
                var elCount = document.querySelector('.counter');
                elCount.innerHTML = `<div class="counter">Your Score: ${gCounter}</div>`
            } else {
                clearInterval(gInterval);
                clearInterval(gGlueInterval);
                gInterval = null;
                gGameOn = false;
                console.log('Game over');
            }
        }
        if (targetCell.gameElement === GLUE) {
            isGlue = true;
            gGlueInterval = setTimeout(function() { isGlue = false }, 3000)
        }


        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        // Dom:
        renderCell(gGamerPos, '');

        // MOVING to selected position
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);

    } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;

    }

}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}