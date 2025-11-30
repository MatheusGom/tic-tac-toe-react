import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './styles/App.css';
import MainMenu from './pages/MainMenu';
import SinglePlayerSetup from './pages/SinglePlayerSetup';
import GameBoard from './pages/GameBoard';
import MultiplayerSetup from './pages/MultiplayerSetup';
import MultiplayerGameBoard from './pages/MultiplayerGameBoard';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function App() {
  const [currentPage, setCurrentPage] = useState('menu');
  const [gameData, setGameData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = () => {
      const newSocket = io(SERVER_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        if (isMounted) {
          setSocket(newSocket);
        }
      });

      newSocket.on('connect_error', () => {
        if (isMounted) {
          setConnectionError(true);
        }
      });
    };

    initializeSocket();

    return () => {
      isMounted = false;
    };
  }, []);

  const navigateTo = (page, data = null) => {
    console.log('Navigating to:', page, 'with data:', data);
    setCurrentPage(page);
    if (data) setGameData(data);
  };

  const renderPage = () => {
    if (connectionError) {
      return (
        <div className="error-page">
          <h1 className="game-title">TIC TAC TOE</h1>
          <div className="error-message">
            <h2>Connection Error</h2>
            <p>Unable to connect to the game server.</p>
            <p>This might be because:</p>
            <ul>
              <li>The server is starting up (can take 1-2 minutes on Render)</li>
              <li>There's a network issue</li>
              <li>The server URL is incorrect</li>
            </ul>
            <button className="menu-btn" onClick={() => navigateTo('menu')}>
              BACK TO MENU
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'menu':
        return <MainMenu navigateTo={navigateTo} />;
      case 'singleplayer-setup':
        return <SinglePlayerSetup navigateTo={navigateTo} />;
      case 'game':
        return <GameBoard navigateTo={navigateTo} gameData={gameData} />;
      case 'multiplayer-setup':
        return <MultiplayerSetup navigateTo={navigateTo} socket={socket} />;
      case 'multiplayer-game':
        return <MultiplayerGameBoard navigateTo={navigateTo} socket={socket} gameData={gameData} />;
      default:
        return <MainMenu navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;