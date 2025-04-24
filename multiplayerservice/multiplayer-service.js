const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // En producción, limita esto a tu dominio
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria para las salas y jugadores
const rooms = new Map();

// Rutas API REST
app.post('/createRoom', (req, res) => {
    try {
        const { roomId, roomName } = req.body;

        if (!roomId || !roomName) {
            return res.status(400).json({ success: false, message: 'Se requiere roomId y roomName' });
        }

        if (rooms.has(roomId)) {
            return res.status(409).json({ success: false, message: 'La sala ya existe' });
        }

        rooms.set(roomId, {
            id: roomId,
            name: roomName,
            players: [],
            createdAt: new Date(),
            gameStarted: false
        });

        console.log(`Sala creada: ${roomId} - ${roomName}`);
        return res.status(201).json({ success: true, roomId });
    } catch (error) {
        console.error('Error al crear sala:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.get('/rooms', (req, res) => {
    try {
        const roomList = Array.from(rooms.values()).map(room => ({
            id: room.id,
            name: room.name,
            playerCount: room.players.length,
            gameStarted: room.gameStarted
        }));

        return res.json({ success: true, rooms: roomList });
    } catch (error) {
        console.error('Error al obtener salas:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Lógica de WebSockets
io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    // Unirse a una sala
    socket.on('joinRoom', async (data) => {
        try {
            const { roomId, username } = data;

            if (!rooms.has(roomId)) {
                socket.emit('error', { message: 'La sala no existe' });
                return;
            }

            const room = rooms.get(roomId);

            if (room.gameStarted) {
                socket.emit('error', { message: 'El juego ya ha comenzado' });
                return;
            }

            // Determinar si es el anfitrión (primer jugador)
            const isHost = room.players.length === 0;

            // Crear objeto jugador
            const player = {
                id: socket.id,
                username: username || 'Anónimo',
                isReady: false,
                isHost,
                joinedAt: new Date()
            };

            // Añadir jugador a la sala
            room.players.push(player);

            // Unir el socket a la sala
            socket.join(roomId);

            // Guardar datos del jugador en el objeto socket
            socket.data.roomId = roomId;
            socket.data.playerId = socket.id;
            socket.data.username = username;

            // Notificar al jugador que se ha unido
            socket.emit('roomJoined', {
                roomId,
                roomName: room.name,
                players: room.players,
                isHost
            });

            // Notificar a los demás jugadores
            socket.to(roomId).emit('playerJoined', {
                playerId: socket.id,
                username: username || 'Anónimo',
                isHost
            });

            console.log(`Jugador ${username} (${socket.id}) se unió a la sala ${roomId}`);
        } catch (error) {
            console.error('Error al unirse a sala:', error);
            socket.emit('error', { message: 'Error al unirse a la sala' });
        }
    });

    // Jugador listo
    socket.on('playerReady', () => {
        try {
            const { roomId, playerId } = socket.data;

            if (!roomId || !rooms.has(roomId)) {
                socket.emit('error', { message: 'No estás en una sala' });
                return;
            }

            const room = rooms.get(roomId);
            const playerIndex = room.players.findIndex(p => p.id === playerId);

            if (playerIndex === -1) {
                socket.emit('error', { message: 'Jugador no encontrado' });
                return;
            }

            // Marcar jugador como listo
            room.players[playerIndex].isReady = true;

            // Notificar a todos los jugadores en la sala
            io.to(roomId).emit('playerReady', { playerId });

            console.log(`Jugador ${playerId} está listo en sala ${roomId}`);

            // Comprobar si todos están listos
            const allReady = room.players.every(p => p.isReady);
            if (allReady) {
                io.to(roomId).emit('allPlayersReady');
            }
        } catch (error) {
            console.error('Error al marcar jugador como listo:', error);
            socket.emit('error', { message: 'Error al marcar como listo' });
        }
    });

    // Iniciar juego (solo anfitrión)
    socket.on('startGame', () => {
        try {
            const { roomId, playerId } = socket.data;

            if (!roomId || !rooms.has(roomId)) {
                socket.emit('error', { message: 'No estás en una sala' });
                return;
            }

            const room = rooms.get(roomId);
            const player = room.players.find(p => p.id === playerId);

            if (!player || !player.isHost) {
                socket.emit('error', { message: 'No tienes permiso para iniciar el juego' });
                return;
            }

            // Verificar que todos estén listos
            const allReady = room.players.every(p => p.isReady);
            if (!allReady) {
                socket.emit('error', { message: 'No todos los jugadores están listos' });
                return;
            }

            // Marcar la sala como iniciada
            room.gameStarted = true;

            // Notificar a todos los jugadores
            io.to(roomId).emit('gameStart', {
                roomId,
                players: room.players
            });

            console.log(`Juego iniciado en sala ${roomId}`);
        } catch (error) {
            console.error('Error al iniciar juego:', error);
            socket.emit('error', { message: 'Error al iniciar el juego' });
        }
    });

    // Abandonar sala
    socket.on('leaveRoom', () => {
        handlePlayerLeave(socket);
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
        handlePlayerLeave(socket);
    });
});

// Función para manejar cuando un jugador abandona la sala
function handlePlayerLeave(socket) {
    try {
        const { roomId, playerId } = socket.data;

        if (!roomId || !rooms.has(roomId)) {
            return;
        }

        const room = rooms.get(roomId);

        // Encontrar y eliminar al jugador
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const player = room.players[playerIndex];
            room.players.splice(playerIndex, 1);

            // Notificar a los demás jugadores
            socket.to(roomId).emit('playerLeft', { playerId });

            console.log(`Jugador ${playerId} abandonó la sala ${roomId}`);

            // Si era el anfitrión, asignar nuevo anfitrión
            if (player.isHost && room.players.length > 0) {
                room.players[0].isHost = true;
                io.to(roomId).emit('newHost', { playerId: room.players[0].id });
            }

            // Si no quedan jugadores, eliminar la sala
            if (room.players.length === 0) {
                rooms.delete(roomId);
                console.log(`Sala ${roomId} eliminada por falta de jugadores`);
            }
        }

        // Salir de la sala
        socket.leave(roomId);

        // Limpiar datos del socket
        delete socket.data.roomId;
        delete socket.data.playerId;
        delete socket.data.username;
    } catch (error) {
        console.error('Error al manejar salida de jugador:', error);
    }
}

// Iniciar servidor
const PORT = process.env.PORT || 8085;
server.listen(PORT, () => {
    console.log(`Servidor multiplayer ejecutándose en puerto ${PORT}`);
});