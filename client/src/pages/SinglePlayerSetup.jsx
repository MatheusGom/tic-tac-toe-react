import React, { useState } from 'react';
import '../styles/SinglePlayerSetup.css';

function SinglePlayerSetup({ navigateTo }) {
    const [playerName, setPlayerName] = useState('');
    const [rounds, setRounds] = useState(1);

    const handleNameChange = (e) => {
        const input = e.target.value;
        const upperCaseInput = input.toUpperCase().slice(0, 12);
        setPlayerName(upperCaseInput);
    };

    const startGame = () => {
        if (!playerName.trim()) {
            window.showAlert('PLEASE ENTER YOUR NAME!');
            return;
        }

        if (playerName.length < 2) {
            window.showAlert('NAME MUST BE AT LEAST 2 CHARACTERS!');
            return;
        }

        navigateTo('game-board', {
            playerName: playerName,
            rounds: parseInt(rounds)
        });
    };

    return (
        <div className="setup-page">
            <h2 className="setup-title">GAME SETUP</h2>

            <div className="pokemon-menu">
                <div className="menu-option">
                    <label htmlFor="playerName">PLAYER NAME:</label>
                    <div className="input-container">
                        <input
                            type="text"
                            id="playerName"
                            className="name-input"
                            value={playerName}
                            onChange={handleNameChange}
                            placeholder="ENTER NAME"
                            maxLength={12}
                        />
                    </div>
                </div>

                <div className="menu-option">
                    <label htmlFor="rounds">NUMBER OF ROUNDS:</label>
                    <select
                        id="rounds"
                        className="rounds-select"
                        value={rounds}
                        onChange={(e) => setRounds(e.target.value)}
                    >
                        {[1, 3, 5, 7].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>

                <div className="button-group">
                    <button className="start-button" onClick={startGame}>
                        START GAME
                    </button>
                    <button
                        className="back-button"
                        onClick={() => navigateTo('menu')}
                    >
                        BACK TO MENU
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SinglePlayerSetup;