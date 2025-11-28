import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
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
  const [isSocketInitialized, setIsSocketInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      try {
        console.log('🔄 Connecting to server:', SERVER_URL);

        const newSocket = io(SERVER_URL, {
          transports: ['websocket', 'polling'],
          timeout: 10000
        });

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 10000);

          newSocket.on('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Connected to server');
            resolve();
          });

          newSocket.on('connect_error', (error) => {
            clearTimeout(timeout);
            console.error('❌ Connection error:', error);
            reject(error);
          });
        });

        if (isMounted) {
          setSocket(newSocket);
          setIsSocketInitialized(true);
          setConnectionError(false);
        }
      } catch (error) {
        console.error('🚨 Failed to initialize socket:', error);
        if (isMounted) {
          setConnectionError(true);
          setIsSocketInitialized(true);
        }
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) setGameData(data);
  };

  const retryConnection = () => {
    setConnectionError(false);
    setIsSocketInitialized(false);
  };

  const renderPage = () => {
    if (connectionError) {
      return (
        <div className="error-page">
          <h1 className="game-title">TIC TAC TOE</h1>
          <div className="error-message">
            <h2>🚨 Connection Error</h2>
            <p>Unable to connect to the game server.</p>
            <p>This might be because:</p>
            <ul>
              <li>The server is starting up (can take 1-2 minutes on Render)</li>
              <li>There's a network issue</li>
              <li>The server URL is incorrect</li>
            </ul>
            <button className="retry-btn" onClick={retryConnection}>
              🔄 TRY AGAIN
            </button>
            <button className="menu-btn" onClick={() => navigateTo('menu')}>
              🎮 PLAY OFFLINE
            </button>
          </div>
        </div>
      );
    }

    if (!isSocketInitialized && (currentPage === 'multiplayer-setup' || currentPage === 'multiplayer-game')) {
      return (
        <div className="loading-page">
          <h1 className="game-title">TIC TAC TOE</h1>
          <div className="loading">
            <div>🔄 CONNECTING TO SERVER...</div>
            <small>This might take a moment on first load</small>
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
        return <MultiplayerGameBoard navigateTo={navigateTo} socket={socket} />;
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