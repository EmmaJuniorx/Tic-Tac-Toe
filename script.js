document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const historyContainer = document.getElementById('history');
    const saveButton = document.getElementById('save-settings');
    const clearHistoryButton = document.getElementById('clear-history');
    const startButton = document.getElementById('start-game');
    const resetButton = document.getElementById('reset');
    const modeSelection = document.getElementById('mode-selection');
    const player1NameInput = document.getElementById('player1-name');
    const player1ColorInput = document.getElementById('player1-color');
    const player2NameInput = document.getElementById('player2-name');
    const player2ColorInput = document.getElementById('player2-color');

    let player1Name = 'Player 1';
    let player2Name = 'Player 2';
    let player1Color = '#ff0000'; // Default color for Player 1
    let player2Color = '#0000ff'; // Default color for Player 2
    let gameMode = 'two-player';
    let currentPlayer = 'player1';
    let gameBoard = Array(9).fill(null);
    let gameActive = false;

    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.cellIndex = i;
            cell.addEventListener('click', () => handleClick(cell));
            board.appendChild(cell);
        }
    }

    function handleClick(cell) {
        const index = cell.dataset.cellIndex;
        if (gameBoard[index] || !gameActive) return;

        const playerMark = currentPlayer === 'player1' ? 'X' : 'O';
        gameBoard[index] = playerMark;
        cell.textContent = playerMark;
        cell.classList.add(currentPlayer);
        
        if (checkWin(playerMark)) {
            endGame(`${currentPlayer === 'player1' ? player1Name : player2Name} wins!`);
        } else if (gameBoard.every(cell => cell)) {
            endGame('It\'s a draw!');
        } else {
            switchPlayer();
            if (gameMode === 'ai' && currentPlayer === 'player2') {
                setTimeout(aiMove, 500); // AI makes a move after a short delay
            }
        }
    }

    function checkWin(playerMark) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winPatterns.some(pattern => 
            pattern.every(index => gameBoard[index] === playerMark)
        );
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    }

    function endGame(message) {
        gameActive = false;
        updateHistory(message);
    }

    function updateHistory(message) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = message;
        historyContainer.appendChild(historyItem);
    }

    function clearHistory() {
        historyContainer.innerHTML = '<h2>Game History</h2>';
    }

    function saveSettings() {
        player1Name = player1NameInput.value;
        player1Color = player1ColorInput.value;
        player2Name = player2NameInput.value;
        player2Color = player2ColorInput.value;
        document.documentElement.style.setProperty('--player1-color', player1Color);
        document.documentElement.style.setProperty('--player2-color', player2Color);
        updateHistory(`Settings updated: Player 1 - ${player1Name} (${player1Color}), Player 2 - ${player2Name} (${player2Color})`);
    }

    function resetGame() {
        gameBoard = Array(9).fill(null);
        gameActive = true;
        currentPlayer = 'player1';
        createBoard();
        updateHistory('Game reset.');
    }

    function aiMove() {
        const bestMove = getBestMove();
        if (bestMove !== null) {
            const cell = board.children[bestMove];
            handleClick(cell);
        }
    }

    function getBestMove() {
        const availableMoves = gameBoard.map((mark, index) => mark === null ? index : null).filter(index => index !== null);
        let bestScore = -Infinity;
        let bestMove = null;

        availableMoves.forEach(move => {
            gameBoard[move] = 'O';
            const score = minimax(gameBoard, false);
            gameBoard[move] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        return bestMove;
    }

    function minimax(board, isMaximizing) {
        const winner = checkWinner();
        if (winner === 'O') return 10;
        if (winner === 'X') return -10;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            board.forEach((cell, index) => {
                if (cell === null) {
                    board[index] = 'O';
                    const score = minimax(board, false);
                    board[index] = null;
                    bestScore = Math.max(score, bestScore);
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            board.forEach((cell, index) => {
                if (cell === null) {
                    board[index] = 'X';
                    const score = minimax(board, true);
                    board[index] = null;
                    bestScore = Math.min(score, bestScore);
                }
            });
            return bestScore;
        }
    }

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        for (const [a, b, c] of winPatterns) {
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                return gameBoard[a];
            }
        }
        return null;
    }

    startButton.addEventListener('click', () => {
        gameMode = modeSelection.value;
        if (gameMode === 'two-player') {
            document.getElementById('player2-section').style.display = 'block';
        } else {
            document.getElementById('player2-section').style.display = 'none';
        }
        document.getElementById('player1-section').style.display = 'block';
        resetGame();
    });

    saveButton.addEventListener('click', saveSettings);
    clearHistoryButton.addEventListener('click', clearHistory);
    resetButton.addEventListener('click', resetGame);

    createBoard();
});
