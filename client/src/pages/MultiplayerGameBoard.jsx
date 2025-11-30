import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';

function MultiplayerGameBoard({ navigateTo, socket, gameData }) {
    const [game, setGame] = useState(() => {
        if (gameData && gameData.gameState) {
            return gameData.gameState;
        }
        return null;
    });

    useEffect(() => {
        const handleGameCreated = (data) => {
            setGame(data.gameState);
        };

        const handleGameJoined = (data) => {
            setGame(data.gameState);
        };

        const handleMoveMade = (data) => {
            setGame(data.gameState);
        };

        const handlePlayerDisconnected = () => {
            alert('Other player disconnected!');
            navigateTo('menu');
        };

        const handleError = (data) => {
            alert('Error: ' + data.message);
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
        navigateTo('menu');
    };

    const makeMove = (position) => {
        if (!game || game.board[position] !== null || game.gameOver || !isMyTurn()) {
            return;
        }
        socket.emit('make-move', { gameId: game.id, position: position });
    };

    const isMyTurn = () => {
        if (!game || !socket) return false;
        const myPlayerKey = getMyPlayerKey();
        return game.currentPlayer === myPlayerKey;
    };

    const getMyPlayerKey = () => {
        if (!game) return null;
        if (game.players.player1.id === socket.id) return 'player1';
        if (game.players.player2.id === socket.id) return 'player2';
        return null;
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

    if (!game) {
        return (
            <div className="game-board-page">
                <h1 className="game-title">TIC TAC TOE</h1>
                <div className="loading">GAME NOT FOUND</div>
                <button className="menu-btn" onClick={() => navigateTo('menu')} style={{ marginTop: '20px' }}>
                    BACK TO MENU
                </button>
            </div>
        );
    }

    if (game.status === 'waiting') {
        return (
            <div className="game-board-page">

                <div className="pokemon-menu" style={{ maxWidth: '500px', margin: '20px auto', textAlign: 'center' }}>
                    <h2 style={{ color: '#e63946', fontSize: '16px', marginBottom: '20px' }}>
                        WAITING FOR PLAYER 2
                    </h2>

                    <div style={{
                        backgroundColor: 'white',
                        border: '3px solid #585858',
                        padding: '15px',
                        margin: '20px 0',
                        borderRadius: '5px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#e63946'
                    }}>
                        GAME ID: {game.id}
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        border: '2px solid #585858',
                        padding: '20px',
                        margin: '20px 0',
                        borderRadius: '5px',
                        fontSize: '10px',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ color: '#e63946', marginBottom: '15px', fontSize: '11px', textAlign: 'center' }}>
                            HOW TO JOIN:
                        </h4>
                        <ol style={{ marginLeft: '20px', padding: '0' }}>
                            <li style={{ marginBottom: '10px' }}>Your friend goes to MULTIPLAYER</li>
                            <li style={{ marginBottom: '10px' }}>Clicks "JOIN"</li>
                            <li style={{ marginBottom: '10px' }}>Enters this ID: <strong style={{ color: '#e63946' }}>{game.id}</strong></li>
                            <li style={{ marginBottom: '10px' }}>Clicks "JOIN" button</li>
                            <li>Game starts automatically!</li>
                        </ol>
                    </div>

                    <button
                        className="back-button"
                        onClick={cancelGame}
                        style={{ marginTop: '15px', width: '100%' }}
                    >
                        CANCEL GAME
                    </button>
                </div>
            </div>
        );
    }

    const myPlayerKey = getMyPlayerKey();
    const isDraw = game.gameOver && game.winner === 'draw';

    const getPlayerStatus = (playerKey) => {
        if (!game.gameOver) return '';

        if (isDraw) return 'draw';

        const player1Score = game.players.player1.score;
        const player2Score = game.players.player2.score;

        if (player1Score > player2Score) {
            return playerKey === 'player1' ? 'winner' : 'loser';
        } else if (player2Score > player1Score) {
            return playerKey === 'player2' ? 'winner' : 'loser';
        }

        return 'draw';
    };

    return (
        <div className="game-board-page">
            <h1 className="game-title">TIC TAC TOE - MULTIPLAYER</h1>

            <div className="game-container">
                <div className="turn-log">
                    <h3>TURN LOG</h3>
                    <div className="log-list">
                        {game.turnLog.map((log, index) => (
                            <div key={index} className="log-item">
                                <span className="turn-number">TURN {log.turn}</span>
                                <span className="log-player">{log.player}</span>
                                <span className="log-position">POS: {log.position}</span>
                            </div>
                        ))}
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
                            <span className={`player-name ${getPlayerStatus('player1')} ${myPlayerKey === 'player1' ? 'my-player' : ''}`}>
                                {game.players.player1.name} (X)
                            </span>
                            <span className="score">{game.players.player1.score}</span>
                        </div>
                        <div className="score-item">
                            <span className={`player-name ${getPlayerStatus('player2')} ${myPlayerKey === 'player2' ? 'my-player' : ''}`}>
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