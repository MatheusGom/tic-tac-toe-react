import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const games = new Map();
const players = new Map();

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Tic Tac Toe Server is running',
        activeGames: games.size,
        activePlayers: players.size,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Tic Tac Toe Multiplayer Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            websocket: '/socket.io/'
        },
        stats: {
            activeGames: games.size,
            activePlayers: players.size
        }
    });
});

class TicTacToeGame {
    constructor(gameId, player1, playerName, rounds = 1) {
        this.id = gameId;
        this.players = {
            player1: {
                id: player1,
                name: playerName,
                symbol: 'X',
                score: 0
            },
            player2: {
                id: null,
                name: 'Waiting...',
                symbol: 'O',
                score: 0
            }
        };
        this.currentRound = 1;
        this.totalRounds = rounds;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'player1';
        this.gameOver = false;
        this.winner = null;
        this.turnLog = [];
        this.status = 'waiting'; 
        this.createdAt = new Date();
        this.lastActivity = new Date();
    }

    addPlayer2(playerId, playerName) {
        this.players.player2.id = playerId;
        this.players.player2.name = playerName;
        this.status = 'playing';
        this.lastActivity = new Date();
    }

    getPlayerKey(playerId) {
        if (this.players.player1.id === playerId) return 'player1';
        if (this.players.player2.id === playerId) return 'player2';
        return null;
    }

    makeMove(position, playerId) {
        if (this.gameOver || this.board[position] !== null) {
            return { success: false, error: 'Invalid move' };
        }

        const playerKey = this.getPlayerKey(playerId);
        if (playerKey !== this.currentPlayer) {
            return { success: false, error: 'Not your turn' };
        }

        this.board[position] = this.players[playerKey].symbol;
        this.lastActivity = new Date();

        this.turnLog.push({
            turn: this.turnLog.length + 1,
            player: this.players[playerKey].name,
            position: position,
            symbol: this.players[playerKey].symbol,
            timestamp: new Date()
        });

        const winnerSymbol = this.checkWinner();
        if (winnerSymbol) {
            const winnerKey = winnerSymbol === 'X' ? 'player1' : 'player2';
            this.players[winnerKey].score += 1;
            this.winner = winnerKey;

            if (this.currentRound < this.totalRounds) {
                this.resetRound(winnerKey);
                return {
                    success: true,
                    gameState: this.getGameState(),
                    roundWinner: winnerKey,
                    message: `${this.players[winnerKey].name} wins round ${this.currentRound - 1}!`
                };
            } else {
                this.gameOver = true;
                this.status = 'finished';
                return {
                    success: true,
                    gameState: this.getGameState(),
                    gameWinner: winnerKey,
                    message: `${this.players[winnerKey].name} wins the game!`
                };
            }
        }

        if (this.board.every(cell => cell !== null)) {
            if (this.currentRound < this.totalRounds) {
                this.resetRound(null);
                return {
                    success: true,
                    gameState: this.getGameState(),
                    roundWinner: 'draw',
                    message: `Round ${this.currentRound - 1} is a draw!`
                };
            } else {
                this.gameOver = true;
                this.status = 'finished';
                this.winner = 'draw';
                return {
                    success: true,
                    gameState: this.getGameState(),
                    gameWinner: 'draw',
                    message: 'The game is a draw!'
                };
            }
        }

        this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';

        return {
            success: true,
            gameState: this.getGameState(),
            message: `It's now ${this.players[this.currentPlayer].name}'s turn`
        };
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let [a, b, c] of lines) {
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }

    resetRound(winner) {
        this.board = Array(9).fill(null);
        this.turnLog = [];
        this.currentRound++;
        this.winner = null;
        this.lastActivity = new Date();

        if (winner === 'player1') {
            this.currentPlayer = 'player1';
        } else if (winner === 'player2') {
            this.currentPlayer = 'player2';
        } else {
            this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
        }
    }

    getGameState() {
        return {
            id: this.id,
            players: this.players,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            turnLog: this.turnLog,
            status: this.status,
            createdAt: this.createdAt,
            lastActivity: this.lastActivity
        };
    }

    disconnectPlayer(playerId) {
        const playerKey = this.getPlayerKey(playerId);
        if (playerKey) {
            this.players[playerKey].id = null;
            this.players[playerKey].name = 'Disconnected';
            this.status = 'finished';
            this.gameOver = true;
        }
    }
}

setInterval(() => {
    const now = new Date();
    const HOURS_6 = 6 * 60 * 60 * 1000; 

    for (const [gameId, game] of games.entries()) {
        if (now - game.lastActivity > HOURS_6) {
            console.log(`Cleaning up inactive game: ${gameId}`);
            games.delete(gameId);

            for (const [playerId, playerGameId] of players.entries()) {
                if (playerGameId === gameId) {
                    players.delete(playerId);
                }
            }
        }
    }
}, 30 * 60 * 1000);

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    console.log('📊 Active games:', games.size);
    console.log('👥 Active players:', players.size);

    socket.on('create-game', (data) => {
        try {
            const gameId = uuidv4().substring(0, 8); 
            const game = new TicTacToeGame(
                gameId,
                socket.id,
                data.playerName,
                data.rounds || 1
            );

            games.set(gameId, game);
            players.set(socket.id, gameId);

            socket.join(gameId);
            socket.emit('game-created', {
                gameId,
                gameState: game.getGameState(),
                message: `Game created! Share this ID: ${gameId}`
            });

            console.log(`🎮 Game created: ${gameId} by ${data.playerName}`);
            console.log('📊 Total games:', games.size);
        } catch (error) {
            console.error('❌ Error creating game:', error);
            socket.emit('error', { message: 'Failed to create game' });
        }
    });

    socket.on('join-game', (data) => {
        try {
            const game = games.get(data.gameId);

            if (!game) {
                socket.emit('error', { message: 'Game not found. Check the Game ID.' });
                return;
            }

            if (game.status !== 'waiting') {
                socket.emit('error', { message: 'Game already started or finished' });
                return;
            }

            if (game.players.player1.id === socket.id) {
                socket.emit('error', { message: 'You are already in this game' });
                return;
            }

            game.addPlayer2(socket.id, data.playerName);
            players.set(socket.id, data.gameId);
            socket.join(data.gameId);

            io.to(data.gameId).emit('game-joined', {
                gameState: game.getGameState(),
                message: `${data.playerName} joined the game!`
            });

            console.log(`🎯 Player ${data.playerName} joined game: ${data.gameId}`);
            console.log('📊 Total games:', games.size);
        } catch (error) {
            console.error('❌ Error joining game:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    socket.on('make-move', (data) => {
        try {
            const game = games.get(data.gameId);

            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            if (game.status !== 'playing') {
                socket.emit('error', { message: 'Game is not active' });
                return;
            }

            const result = game.makeMove(data.position, socket.id);

            if (result.success) {
                io.to(data.gameId).emit('move-made', {
                    gameState: result.gameState,
                    roundWinner: result.roundWinner,
                    gameWinner: result.gameWinner,
                    message: result.message
                });

                console.log(`🎲 Move made in game ${data.gameId} by ${socket.id} at position ${data.position}`);
            } else {
                socket.emit('error', { message: result.error });
            }
        } catch (error) {
            console.error('❌ Error making move:', error);
            socket.emit('error', { message: 'Failed to make move' });
        }
    });

    socket.on('reconnect-game', (data) => {
        const gameId = players.get(socket.id);
        if (gameId) {
            const game = games.get(gameId);
            if (game) {
                socket.join(gameId);
                socket.emit('game-reconnected', {
                    gameState: game.getGameState(),
                    message: 'Reconnected to your game'
                });

                socket.to(gameId).emit('player-reconnected', {
                    message: `${game.players[game.getPlayerKey(socket.id)].name} reconnected`
                });
            }
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ User disconnected:', socket.id, 'Reason:', reason);

        const gameId = players.get(socket.id);
        if (gameId) {
            const game = games.get(gameId);
            if (game) {
                game.disconnectPlayer(socket.id);

                socket.to(gameId).emit('player-disconnected', {
                    message: 'The other player disconnected',
                    gameState: game.getGameState()
                });

                console.log(`🚪 Player disconnected from game: ${gameId}`);
            }

            players.delete(socket.id);
        }

        console.log('📊 Active games after disconnect:', games.size);
        console.log('👥 Active players after disconnect:', players.size);
    });

    socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
    });
});

app.use((error, req, res, next) => {
    console.error('🚨 Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on the server'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        availableRoutes: {
            'GET /': 'Server information',
            'GET /health': 'Health check'
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 =================================');
    console.log('🎯 Tic Tac Toe Multiplayer Server');
    console.log('🚀 =================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
    console.log('✅ Server is ready to accept connections');
    console.log('🚀 =================================');
});

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export { app, server, io };