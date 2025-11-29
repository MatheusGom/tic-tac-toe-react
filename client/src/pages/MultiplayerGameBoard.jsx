import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';

function MultiplayerGameBoard({ navigateTo, socket, gameData }) {
    console.log('=== 🚨 DEBUG START 🚨 ===');
    console.log('🔍 gameData:', gameData);
    console.log('🔍 gameData.gameState:', gameData?.gameState);
    console.log('🔍 socket connected:', socket?.connected);
    console.log('🔍 socket id:', socket?.id);
    console.log('=== 🚨 DEBUG END 🚨 ===');

    // DEBUG: Força um estado de jogo para teste
    const debugGame = {
        id: 'DEBUG123',
        players: {
            player1: { id: 'debug1', name: 'DebugPlayer', symbol: 'X', score: 0 },
            player2: { id: null, name: 'Waiting...', symbol: 'O', score: 0 }
        },
        currentRound: 1,
        totalRounds: 3,
        board: Array(9).fill(null),
        currentPlayer: 'player1',
        gameOver: false,
        winner: null,
        turnLog: [],
        status: 'waiting'
    };

    const [game, setGame] = useState(debugGame); // SEMPRE usa o debug game

    useEffect(() => {
        console.log('=== 🎯 SOCKET EVENT SETUP ===');

        const handleGameCreated = (data) => {
            console.log('✅ SERVER: Game created:', data);
            setGame(data.gameState);
        };

        const handleGameJoined = (data) => {
            console.log('✅ SERVER: Game joined:', data);
            setGame(data.gameState);
        };

        const handleMoveMade = (data) => {
            console.log('✅ SERVER: Move made:', data);
            setGame(data.gameState);
        };

        const handleError = (data) => {
            console.error('❌ SERVER Error:', data);
            alert('Server Error: ' + data.message);
        };

        // Escuta todos os eventos
        socket.on('game-created', handleGameCreated);
        socket.on('game-joined', handleGameJoined);
        socket.on('move-made', handleMoveMade);
        socket.on('player-disconnected', () => {
            console.log('❌ Player disconnected');
            alert('Other player disconnected!');
            navigateTo('menu');
        });
        socket.on('error', handleError);

        // DEBUG: Testa se o socket está funcionando
        console.log('🎯 Socket listeners registered');
        socket.emit('ping', { test: 'debug' });

        return () => {
            socket.off('game-created', handleGameCreated);
            socket.off('game-joined', handleGameJoined);
            socket.off('move-made', handleMoveMade);
            socket.off('player-disconnected');
            socket.off('error', handleError);
        };
    }, [socket, navigateTo]);

    const cancelGame = () => {
        console.log('🚪 Cancelling game:', game.id);
        if (socket) {
            socket.emit('leave-game', { gameId: game.id });
        }
        navigateTo('menu');
    };

    // SEMPRE MOSTRA A SALA DE ESPERA
    console.log('🎮 RENDERING: Waiting Room');
    return (
        <div className="game-board-page">
            <h1 className="game-title">TIC TAC TOE - MULTIPLAYER</h1>

            <div style={{
                backgroundColor: '#f0f0f0',
                border: '5px solid #585858',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.7)',
                color: '#333',
                textAlign: 'center',
                maxWidth: '500px',
                margin: '20px auto'
            }}>
                <h2 style={{
                    color: '#e63946',
                    fontSize: '16px',
                    marginBottom: '20px',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                }}>
                    WAITING FOR PLAYER 2
                </h2>

                <div style={{
                    backgroundColor: 'white',
                    border: '3px solid #585858',
                    padding: '15px',
                    margin: '20px 0',
                    borderRadius: '5px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#e63946',
                    fontFamily: 'monospace',
                    letterSpacing: '2px'
                }}>
                    GAME ID: {game.id}
                </div>

                <div style={{
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '25px',
                    lineHeight: '1.5',
                    backgroundColor: '#fff3cd',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '2px solid #ffeaa7'
                }}>
                    <strong>SHARE THIS WITH YOUR FRIEND:</strong><br />
                    <span style={{ color: '#e63946', fontSize: '16px' }}>{game.id}</span>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #585858',
                    padding: '15px',
                    margin: '20px 0',
                    borderRadius: '5px',
                    fontSize: '11px',
                    textAlign: 'left'
                }}>
                    <h4 style={{
                        color: '#e63946',
                        marginBottom: '10px',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>HOW TO JOIN THIS GAME:</h4>
                    <ol style={{ marginLeft: '15px' }}>
                        <li style={{ marginBottom: '8px' }}>Your friend goes to MULTIPLAYER</li>
                        <li style={{ marginBottom: '8px' }}>Clicks "JOIN GAME"</li>
                        <li style={{ marginBottom: '8px' }}>Enters this ID: <strong style={{ color: '#e63946' }}>{game.id}</strong></li>
                        <li style={{ marginBottom: '8px' }}>Clicks "JOIN GAME" button</li>
                        <li>Game starts automatically!</li>
                    </ol>
                </div>

                <div style={{
                    margin: '20px 0',
                    padding: '10px',
                    backgroundColor: '#d4edda',
                    border: '2px solid #c3e6cb',
                    borderRadius: '5px',
                    fontSize: '10px',
                    color: '#155724'
                }}>
                    <strong>DEBUG INFO:</strong><br />
                    • Socket: {socket?.connected ? 'CONNECTED' : 'DISCONNECTED'}<br />
                    • Game Data: {gameData ? 'RECEIVED' : 'MISSING'}<br />
                    • Game State: {game?.status || 'UNKNOWN'}
                </div>

                <button
                    onClick={cancelGame}
                    style={{
                        backgroundColor: '#8d99ae',
                        color: 'white',
                        padding: '15px 30px',
                        border: '3px solid #585858',
                        borderRadius: '5px',
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '15px',
                        width: '100%',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#727d8f'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#8d99ae'}
                >
                    CANCEL GAME
                </button>
            </div>
        </div>
    );
}

export default MultiplayerGameBoard;