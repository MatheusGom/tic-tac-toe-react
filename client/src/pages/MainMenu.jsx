import React from 'react';
import '../styles/MainMenu.css';

function MainMenu({ navigateTo }) {
    return (
        <div className="main-menu">
            <h1 className="main-title">TIC TAC TOE</h1>

            <div className="pokemon-menu">
                <ul>
                    <li onClick={() => navigateTo('single-player-setup')}>
                        <a>SINGLE PLAYER</a>
                    </li>
                    <li onClick={() => navigateTo('multiplayer-setup')}>
                        <a>MULTI PLAYER</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default MainMenu;