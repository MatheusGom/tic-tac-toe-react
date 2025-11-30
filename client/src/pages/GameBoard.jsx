import React, { useState, useEffect, useCallback } from 'react';
import '../styles/GameBoard.css';

function GameBoard({ gameData, navigateTo }) {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initializeGame = () => {
            setLoading(true);

            setTimeout(() => {
                const startingPlayer = Math.random() > 0.5 ? 'player' : 'opponent';
                setGame({
                    id: 'offline-game-' + Date.now(),
                    players: {
                        player: {
                            name: gameData?.playerName || 'PLAYER1',
                            score: 0
                        },
                        opponent: {
                            name: 'CPU',
                            score: 0
                        }
                    },
                    currentRound: 1,
                    totalRounds: gameData?.rounds || 1,
                    board: Array(9).fill(null),
                    currentPlayer: startingPlayer,
                    gameOver: false,
                    winner: null,
                    turnLog: []
                });
                setLoading(false);
            }, 500);
        };

        initializeGame();
    }, [gameData]);

    const resetRound = useCallback((winner) => {
        setGame(prev => ({
            ...prev,
            board: Array(9).fill(null),
            turnLog: [],
            gameOver: false,
            winner: null,
            currentRound: prev.currentRound + 1,
            currentPlayer: winner === 'player' ? 'opponent' : 'player',
        }));
    }, []);

    const checkWinner = (board) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const determineFinalWinner = useCallback((players) => {
        if (players.player.score > players.opponent.score) {
            return 'player';
        } else if (players.opponent.score > players.player.score) {
            return 'opponent';
        } else {
            return 'draw';
        }
    }, []);

    const makeCPUMove = useCallback(() => {
        if (!game || game.gameOver || game.currentPlayer !== 'opponent') return;

        const emptyCells = game.board
            .map((cell, index) => cell === null ? index : null)
            .filter(cell => cell !== null);

        if (emptyCells.length === 0) return;

        const randomPosition = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = [...game.board];
        newBoard[randomPosition] = 'O';

        const newTurnLog = [...game.turnLog, {
            turn: game.turnLog.length + 1,
            player: game.players.opponent.name,
            position: randomPosition
        }];

        const winner = checkWinner(newBoard);
        const isDraw = newBoard.every(cell => cell !== null);

        let newGameState = {
            ...game,
            board: newBoard,
            turnLog: newTurnLog,
            currentPlayer: 'player'
        };

        if (winner) {
            const winnerKey = winner === 'X' ? 'player' : 'opponent';
            newGameState = {
                ...newGameState,
                players: {
                    ...newGameState.players,
                    [winnerKey]: {
                        ...newGameState.players[winnerKey],
                        score: newGameState.players[winnerKey].score + 1
                    }
                }
            };

            if (newGameState.currentRound < newGameState.totalRounds) {
                setTimeout(() => resetRound(winnerKey), 1500);
            } else {
                const finalWinner = determineFinalWinner(newGameState.players);
                newGameState.gameOver = true;
                newGameState.winner = finalWinner;
            }
        } else if (isDraw) {
            if (newGameState.currentRound < newGameState.totalRounds) {
                setTimeout(() => resetRound(null), 1500);
            } else {
                const finalWinner = determineFinalWinner(newGameState.players);
                newGameState.gameOver = true;
                newGameState.winner = finalWinner;
            }
        }

        setGame(newGameState);
    }, [game, resetRound, determineFinalWinner]);

    useEffect(() => {
        if (game && game.currentPlayer === 'opponent' && !game.gameOver) {
            const timer = setTimeout(makeCPUMove, 800);
            return () => clearTimeout(timer);
        }
    }, [game, makeCPUMove]);

    const makeMove = (position) => {
        if (!game || game.board[position] !== null || game.gameOver || game.currentPlayer !== 'player') {
            return;
        }

        const newBoard = [...game.board];
        newBoard[position] = 'X';

        const newTurnLog = [...game.turnLog, {
            turn: game.turnLog.length + 1,
            player: game.players.player.name,
            position: position
        }];

        const winner = checkWinner(newBoard);
        const isDraw = newBoard.every(cell => cell !== null);

        let newGameState = {
            ...game,
            board: newBoard,
            turnLog: newTurnLog,
            currentPlayer: 'opponent'
        };

        if (winner) {
            const winnerKey = 'player';
            newGameState = {
                ...newGameState,
                players: {
                    ...newGameState.players,
                    [winnerKey]: {
                        ...newGameState.players[winnerKey],
                        score: newGameState.players[winnerKey].score + 1
                    }
                }
            };

            if (newGameState.currentRound < newGameState.totalRounds) {
                setTimeout(() => resetRound(winnerKey), 1500);
            } else {
                const finalWinner = determineFinalWinner(newGameState.players);
                newGameState.gameOver = true;
                newGameState.winner = finalWinner;
            }
        } else if (isDraw) {
            if (newGameState.currentRound < newGameState.totalRounds) {
                setTimeout(() => resetRound(null), 1500);
            } else {
                const finalWinner = determineFinalWinner(newGameState.players);
                newGameState.gameOver = true;
                newGameState.winner = finalWinner;
            }
        }

        setGame(newGameState);
    };

    const getCellSymbol = (cell) => {
        return cell === 'X' ? 'X' : cell === 'O' ? 'O' : '';
    };

    const renderCell = (index) => (
        <div
            key={index}
            className={`cell ${game?.board[index] ? `cell-${game.board[index].toLowerCase()}` : ''} ${game?.board[index] === null && !game?.gameOver && game?.currentPlayer === 'player' ? '' : 'cell-disabled'
                }`}
            onClick={() => makeMove(index)}
        >
            {getCellSymbol(game?.board[index])}
        </div>
    );

    if (!game || loading) {
        return (
            <div className="game-board-page">
                <h1 className="game-title">TIC TAC TOE</h1>
                <div className="loading">LOADING GAME...</div>
            </div>
        );
    }

    const isDraw = game.gameOver && game.winner === 'draw';

    return (
        <div className="game-board-page">
            <h1 className="game-title">TIC TAC TOE</h1>

            <div className="game-container">
                <div className="turn-log">
                    <h3>TURN LOG</h3>
                    <div className="turn-log-column">
                        <div className="log-list">
                            {game.turnLog.map((log, index) => (
                                <div key={index} className="log-item">
                                    <span className="turn-number">TURN {log.turn}</span>
                                    <span className="log-player">{log.player}</span>
                                    <span className="log-position">POS: {log.position}</span>
                                </div>
                            ))}
                            {game.turnLog.length === 0 && (
                                <div className="no-log">NO MOVES YET</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="board-section">
                    <div className="board-header">
                        <div className="round-info">
                            ROUND {game.currentRound} OF {game.totalRounds}
                        </div>
                        <div className="current-turn">
                            TURN: {game.players[game.currentPlayer].name}
                        </div>
                    </div>

                    <div className="board">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderCell)}
                    </div>
                </div>

                <div className="scoreboard-column">
                    <div className="scoreboard">
                        <h3>SCOREBOARD</h3>
                        <div className="score-item">
                            <span className={`player-name ${game.gameOver && game.winner === 'player' ? 'winner' :
                                game.gameOver && game.winner === 'opponent' ? 'loser' :
                                    isDraw ? 'draw' : ''
                                }`}>
                                {game.players.player.name}
                            </span>

                            <span className="score">{game.players.player.score}</span>
                        </div>
                        <div className="score-item">
                            <span className={`player-name ${game.gameOver && game.winner === 'opponent' ? 'winner' :
                                game.gameOver && game.winner === 'player' ? 'loser' :
                                    isDraw ? 'draw' : ''
                                }`}>
                                {game.players.opponent.name}
                            </span>

                            <span className="score">{game.players.opponent.score}</span>
                        </div>
                        <div className="button-container">
                            <button className="menu-btn" onClick={() => navigateTo('menu')}>
                                BACK TO MENU
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameBoard;