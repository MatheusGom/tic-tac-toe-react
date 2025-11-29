import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';

function MultiplayerGameBoard({ navigateTo, socket }) {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWaitingRoom, setShowWaitingRoom] = useState(false);

    useEffect(() => {
        const handleGameCreated = (data) => {
            setGame(data.gameState);
            setLoading(false);
            setShowWaitingRoom(true);
        };

        const handleGameJoined = (data) => {
            setGame(data.gameState);
            setLoading(false);
            setShowWaitingRoom(false);
        };

        const handleMoveMade = (data) => {
            setGame(data.gameState);
        };

        const handlePlayerDisconnected = () => {
            alert('Other player disconnected!');
            navigateTo('menu');
        };

        const handleError = (data) => {
            alert(data.message);
            navigateTo('menu');
        };

        socket.on('game-created', handleGameCreated);
        socket.on('game-joined', handleGameJoined);
        socket.on('move-made', handleMoveMade);
        socket.on('player-disconnected', handlePlayerDisconnected);
        socket.on('error', handleError);

        return () => {
            socket.off('game-created', handleGameCreated);
            socket.off('game-joined', handleGameJoined);
            socket.off('move-made', handleMoveMade);
            socket.off('player-disconnected', handlePlayerDisconnected);
            socket.off('error', handleError);
        };
    }, [socket, navigateTo]);

    const cancelGame = () => {
        if (game && socket) {
            socket.emit('leave-game', { gameId: game.id });
        }
        navigateTo('multiplayer-setup');
    };

    const makeMove = (position) => {
        if (!game ||
            game.board[position] !== null ||
            game.gameOver ||
            !isMyTurn()) {
            return;
        }

        socket.emit('make-move', {
            gameId: game.id,
            position: position
        });
    };

    const isMyTurn = () => {
        if (!game || !socket) return false;

        const currentPlayerId = game.currentPlayer;
        const myPlayerKey = getMyPlayerKey();

        return currentPlayerId === myPlayerKey;
    };

    const getMyPlayerKey = () => {
        if (!game) return null;

        if (game.players.player1.id === socket.id) return 'player1';
        if (game.players.player2.id === socket.id) return 'player2';
        return null;
    };

    const getMyPlayer = () => {
        const myKey = getMyPlayerKey();
        return myKey ? game.players[myKey] : null;
    };

    const getCellSymbol = (cell) => {
        return cell === 'X' ? 'X' : cell === 'O' ? 'O' : '';
    };

    const renderCell = (index) => (
        <div
            key={index}
            className={`cell ${game?.board[index] ? `cell-${game.board[index].toLowerCase()}` : ''} ${game?.board[index] === null && !game?.gameOver && isMyTurn() ? '' : 'cell-disabled'
                }`}
            onClick={() => makeMove(index)}
        >
            {getCellSymbol(game?.board[index])}
        </div>
    );

    if (loading || !game) {
        return (
            <div className="game-board-page">
                <h1 className="game-title">TIC TAC TOE</h1>
                <div className="loading">LOADING GAME...</div>
            </div>
        );
    }

    if (showWaitingRoom && game.status === 'waiting') {
        return (
            <div className="waiting-room">
                <h1 className="game-title">TIC TAC TOE - MULTIPLAYER</h1>

                <div className="waiting-content">
                    <h2 className="waiting-title">WAITING FOR PLAYER 2</h2>

                    <div className="game-id-display">
                        GAME ID: {game.id}
                    </div>

                    <div className="waiting-message">
                        Share this Game ID with your friend so they can join the game
                        <span className="loading-dots"></span>
                    </div>

                    <div className="instructions">
                        <h4>HOW TO PLAY:</h4>
                        <ol>
                            <li>Share the Game ID above with your friend</li>
                            <li>Your friend should go to Multiplayer mode and click "JOIN GAME"</li>
                            <li>They need to enter the Game ID and their name</li>
                            <li>The game will start automatically when they join</li>
                        </ol>
                    </div>

                    <button className="cancel-button" onClick={cancelGame}>
                        CANCEL GAME
                    </button>
                </div>
            </div>
        );
    }

    const isDraw = game.gameOver && game.winner === 'draw';
    const myPlayer = getMyPlayer();

    return (
        <div className="game-board-page">
            <h1 className="game-title">TIC TAC TOE - MULTIPLAYER</h1>

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
                            {!isMyTurn() && ' (Waiting...)'}
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
                            <span className={`player-name ${game.gameOver && game.winner === 'player1' ? 'winner' :
                                    game.gameOver && game.winner === 'player2' ? 'loser' :
                                        isDraw ? 'draw' : ''
                                } ${myPlayer?.symbol === 'X' ? 'my-player' : ''}`}>
                                {game.players.player1.name} (X)
                            </span>
                            <span className="score">{game.players.player1.score}</span>
                        </div>
                        <div className="score-item">
                            <span className={`player-name ${game.gameOver && game.winner === 'player2' ? 'winner' :
                                    game.gameOver && game.winner === 'player1' ? 'loser' :
                                        isDraw ? 'draw' : ''
                                } ${myPlayer?.symbol === 'O' ? 'my-player' : ''}`}>
                                {game.players.player2.name} (O)
                            </span>
                            <span className="score">{game.players.player2.score}</span>
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

export default MultiplayerGameBoard;