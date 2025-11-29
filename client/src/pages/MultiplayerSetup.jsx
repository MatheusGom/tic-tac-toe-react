import React, { useState, useEffect } from 'react';
import '../styles/MultiplayerSetup.css';

function MultiplayerSetup({ navigateTo, socket }) {
    const [gameId, setGameId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [rounds, setRounds] = useState(1);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const handleGameCreated = (data) => {
            console.log('✅ MultiplayerSetup: Game created, navigating...', data);
            setIsCreating(false);
            navigateTo('multiplayer-game', data);
        };

        const handleGameJoined = (data) => {
            console.log('✅ MultiplayerSetup: Game joined, navigating...', data);
            navigateTo('multiplayer-game', data);
        };

        const handleError = (data) => {
            console.error('❌ MultiplayerSetup Error:', data);
            alert(data.message);
            setIsCreating(false);
        };

        if (socket) {
            socket.on('game-created', handleGameCreated);
            socket.on('game-joined', handleGameJoined);
            socket.on('error', handleError);
        }

        return () => {
            if (socket) {
                socket.off('game-created', handleGameCreated);
                socket.off('game-joined', handleGameJoined);
                socket.off('error', handleError);
            }
        };
    }, [socket, navigateTo]);

    const createGame = () => {
        if (!playerName.trim() || !socket) return;

        console.log('🎮 Creating game...', { playerName, rounds });
        setIsCreating(true);
        socket.emit('create-game', {
            playerName: playerName.trim(),
            rounds: parseInt(rounds)
        });
    };

    const joinGame = () => {
        if (!playerName.trim() || !gameId.trim() || !socket) return;

        console.log('🎮 Joining game...', { gameId, playerName });
        socket.emit('join-game', {
            gameId: gameId.trim(),
            playerName: playerName.trim()
        });
    };

    return (
        <div className="multiplayer-setup-page">
            <h1 className="game-title">MULTIPLAYER MODE</h1>

            <div className="pokemon-menu">
                {!socket && (
                    <div className="connection-warning">
                        Connecting to server... Please wait.
                    </div>
                )}

                <div className="menu-option">
                    <label>YOUR NAME</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={20}
                        className="name-input"
                        disabled={!socket}
                    />
                </div>

                <div className="menu-option">
                    <label>ROUNDS</label>
                    <select
                        value={rounds}
                        onChange={(e) => setRounds(e.target.value)}
                        className="rounds-select"
                        disabled={!socket}
                    >
                        <option value={1}>1 Round</option>
                        <option value={3}>3 Rounds</option>
                        <option value={5}>5 Rounds</option>
                    </select>
                </div>

                <div className="button-group">
                    <button
                        className="create-button"
                        onClick={createGame}
                        disabled={!playerName || isCreating || !socket}
                    >
                        {isCreating ? 'CREATING...' : 'CREATE GAME'}
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="join-section">
                        <input
                            type="text"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            placeholder="Enter Game ID"
                            className="game-id-input"
                            disabled={!socket}
                        />
                        <button
                            className="join-button"
                            onClick={joinGame}
                            disabled={!playerName || !gameId || !socket}
                        >
                            JOIN GAME
                        </button>
                    </div>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigateTo('menu')}
                >
                    BACK TO MENU
                </button>
            </div>
        </div>
    );
}

export default MultiplayerSetup;