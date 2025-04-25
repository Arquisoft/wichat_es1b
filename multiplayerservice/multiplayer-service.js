/**
 * Servidor de multiplayer utilizando Socket.IO
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

class MultiplayerServer {
    constructor(port = 8085) {
        // Configuración del servidor
        this.port = port;
        this.app = express();
        this.server = http.createServer(this.app);

        // Configuración de CORS
        this.app.use(cors({
            origin: "*", // En producción, limitar a los orígenes permitidos
            methods: ["GET", "POST"],
        }));

        // Middleware para parsear JSON
        this.app.use(express.json());

        // Inicializar Socket.IO
        this.io = new Server(this.server, {
            cors: {
                origin: "*", // En producción, limitar a los orígenes permitidos
                methods: ["GET", "POST"],
            },
        });

        // Almacenamiento de datos
        this.rooms = new Map(); // Mapa de salas: roomId -> datos de la sala
        this.players = new Map(); // Mapa de jugadores: socketId -> datos del jugador

        // Configurar rutas HTTP
        this.setupRoutes();

        // Configurar eventos de Socket.IO
        this.setupSocketEvents();
    }

    /**
     * Configura las rutas HTTP del servidor
     */
    setupRoutes() {
        // Ruta para verificar que el servidor está funcionando
        this.app.get("/health", (req, res) => {
            res.status(200).json({ status: "ok", uptime: process.uptime() });
        });

        // Ruta para crear una sala
        this.app.post("/createRoom", (req, res) => {
            try {
                const { roomId, roomName } = req.body;

                // Validar datos
                if (!roomId) {
                    return res.status(400).json({ success: false, message: "Se requiere un ID de sala" });
                }

                // Si la sala ya existe, devuelve éxito igualmente (idempotente)
                if (this.rooms.has(roomId)) {
                    return res.status(200).json({
                        success: true,
                        message: "La sala ya existe",
                        roomId,
                        roomName: this.rooms.get(roomId).name
                    });
                }

                // Crear la sala
                const room = {
                    id: roomId,
                    name: roomName || `Sala ${roomId}`,
                    players: [],
                    createdAt: new Date(),
                    gameStarted: false,
                    hostId: null, // Se asignará cuando el primer jugador se una
                };

                this.rooms.set(roomId, room);

                console.log(`Sala creada: ${roomId} - ${roomName}`);
                res.status(201).json({ success: true, roomId, roomName: room.name });
            } catch (error) {
                console.error("Error al crear sala:", error);
                res.status(500).json({ success: false, message: "Error interno del servidor" });
            }
        });

        // Ruta para obtener información de una sala
        this.app.get("/rooms/:roomId", (req, res) => {
            const { roomId } = req.params;
            const room = this.rooms.get(roomId);

            if (!room) {
                return res.status(404).json({ success: false, message: "Sala no encontrada" });
            }

            // Devolver información pública de la sala
            res.status(200).json({
                success: true,
                room: {
                    id: room.id,
                    name: room.name,
                    playerCount: room.players.length,
                    gameStarted: room.gameStarted,
                    createdAt: room.createdAt,
                },
            });
        });

        // Ruta para obtener jugadores en una sala
        this.app.get("/rooms/:roomId/players", (req, res) => {
            const { roomId } = req.params;
            const room = this.rooms.get(roomId);

            if (!room) {
                return res.status(404).json({ success: false, message: "Sala no encontrada" });
            }

            // Devolver lista de jugadores (sin información sensible)
            res.status(200).json({
                success: true,
                players: room.players.map((player) => ({
                    id: player.id,
                    username: player.username,
                    isReady: player.isReady,
                    isHost: player.id === room.hostId,
                })),
            });
        });
    }

    /**
     * Configura los eventos de Socket.IO
     */
    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log(`Nuevo cliente conectado: ${socket.id}`);

            // Almacenar información básica del jugador
            this.players.set(socket.id, {
                id: socket.id,
                username: null,
                roomId: null,
                isReady: false,
            });

            // Evento: Unirse a una sala
            socket.on("joinRoom", (data) => {
                this.handleJoinRoom(socket, data);
            });

            // Evento: Marcar jugador como listo
            socket.on("playerReady", (data) => {
                this.handlePlayerReady(socket, data);
            });

            // Evento: Iniciar juego
            socket.on("startGame", (data) => {
                this.handleStartGame(socket, data);
            });

            // Evento: Abandonar sala
            socket.on("leaveRoom", (data) => {
                this.handleLeaveRoom(socket, data);
            });

            // Evento: Mensaje general
            socket.on("message", (data) => {
                this.handleMessage(socket, data);
            });

            // Evento: Desconexión
            socket.on("disconnect", () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Maneja el evento de unirse a una sala
     * @param {Socket} socket - Socket del cliente
     * @param {Object} data - Datos del evento
     */
    handleJoinRoom(socket, data) {
        try {
            const { roomId, username } = data;

            // Validar datos
            if (!roomId) {
                return socket.emit("error", { message: "Se requiere un ID de sala" });
            }

            if (!username) {
                return socket.emit("error", { message: "Se requiere un nombre de usuario" });
            }

            // Verificar si la sala existe
            const room = this.rooms.get(roomId);
            if (!room) {
                return socket.emit("error", { message: "La sala no existe" });
            }

            // Verificar si el juego ya comenzó
            if (room.gameStarted) {
                return socket.emit("error", { message: "El juego ya ha comenzado" });
            }

            // Verificar si el jugador ya está en otra sala
            const player = this.players.get(socket.id);
            if (player.roomId && player.roomId !== roomId) {
                // Abandonar la sala anterior
                this.handleLeaveRoom(socket, { roomId: player.roomId });
            }

            // Actualizar información del jugador
            player.username = username;
            player.roomId = roomId;
            player.isReady = false;

            // Determinar si es el anfitrión (primer jugador en unirse)
            const isHost = room.players.length === 0;
            if (isHost) {
                room.hostId = socket.id;
            }

            // Añadir jugador a la sala
            const playerData = {
                id: socket.id,
                username: username,
                isReady: false,
                isHost: isHost,
                joinedAt: new Date(),
            };

            room.players.push(playerData);

            // Unir el socket a la sala
            socket.join(roomId);

            console.log(`Jugador ${username} (${socket.id}) unido a sala ${roomId}`);

            // Notificar al jugador que se ha unido
            socket.emit("roomJoined", {
                roomId: roomId,
                roomName: room.name,
                isHost: isHost,
                hostId: room.hostId,
                players: room.players.map((p) => ({
                    id: p.id,
                    username: p.username,
                    isReady: p.id === room.hostId || p.isReady,
                    isHost: p.id === room.hostId,
                })),
            });

            // Notificar a los demás jugadores
            socket.to(roomId).emit("playerJoined", {
                playerId: socket.id,
                username: username,
                isHost: isHost,
            });
        } catch (error) {
            console.error("Error al unirse a sala:", error);
            socket.emit("error", { message: "Error al unirse a la sala" });
        }
    }

    /**
     * Maneja el evento de marcar jugador como listo
     * @param {Socket} socket - Socket del cliente
     * @param {Object} data - Datos del evento
     */
    handlePlayerReady(socket, data) {
        try {
            const { roomId } = data;

            // Validar datos
            if (!roomId) {
                return socket.emit("error", { message: "Se requiere un ID de sala" });
            }

            // Verificar si la sala existe
            const room = this.rooms.get(roomId);
            if (!room) {
                return socket.emit("error", { message: "La sala no existe" });
            }

            // Verificar si el jugador está en la sala
            const player = this.players.get(socket.id);
            if (!player || player.roomId !== roomId) {
                return socket.emit("error", { message: "No estás en esta sala" });
            }

            // Marcar jugador como listo
            player.isReady = true;

            // Actualizar estado en la sala
            const roomPlayer = room.players.find((p) => p.id === socket.id);
            if (roomPlayer) {
                roomPlayer.isReady = true;
            }

            console.log(`Jugador ${player.username} (${socket.id}) listo en sala ${roomId}`);

            // Notificar a todos los jugadores en la sala
            this.io.to(roomId).emit("playerReady", {
                playerId: socket.id,
                username: player.username,
            });

            // Verificar si todos los jugadores están listos
            const allReady = room.players.every((p) => p.isReady);
            if (allReady && room.players.length > 1) {
                this.io.to(roomId).emit("allPlayersReady");
            }
        } catch (error) {
            console.error("Error al marcar jugador como listo:", error);
            socket.emit("error", { message: "Error al marcar como listo" });
        }
    }

    /**
     * Maneja el evento de iniciar juego
     * @param {Socket} socket - Socket del cliente
     * @param {Object} data - Datos del evento
     */
    handleStartGame(socket, data) {
        try {
            const { roomId } = data;

            // Validar datos
            if (!roomId) {
                return socket.emit("error", { message: "Se requiere un ID de sala" });
            }

            // Verificar si la sala existe
            const room = this.rooms.get(roomId);
            if (!room) {
                return socket.emit("error", { message: "La sala no existe" });
            }

            // Verificar si el jugador es el anfitrión
            if (room.hostId !== socket.id) {
                return socket.emit("error", { message: "Solo el anfitrión puede iniciar el juego" });
            }

            // Verificar si hay suficientes jugadores
            if (room.players.length < 2) {
                return socket.emit("error", { message: "Se necesitan al menos 2 jugadores para iniciar" });
            }

            // Verificar si todos los jugadores están listos
            const allReady = room.players.every((p) => p.isReady);
            if (!allReady) {
                return socket.emit("error", { message: "No todos los jugadores están listos" });
            }

            // Marcar la sala como iniciada
            room.gameStarted = true;
            room.gameStartedAt = new Date();

            console.log(`Juego iniciado en sala ${roomId}`);

            // Notificar a todos los jugadores
            this.io.to(roomId).emit("gameStart", {
                roomId: roomId,
                players: room.players.map((p) => ({
                    id: p.id,
                    username: p.username,
                })),
            });
        } catch (error) {
            console.error("Error al iniciar juego:", error);
            socket.emit("error", { message: "Error al iniciar el juego" });
        }
    }

    /**
     * Maneja el evento de abandonar sala
     * @param {Socket} socket - Socket del cliente
     * @param {Object} data - Datos del evento
     */
    handleLeaveRoom(socket, data) {
        try {
            const { roomId } = data;

            // Validar datos
            if (!roomId) {
                return socket.emit("error", { message: "Se requiere un ID de sala" });
            }

            // Verificar si la sala existe
            const room = this.rooms.get(roomId);
            if (!room) {
                return;
            }

            // Verificar si el jugador está en la sala
            const player = this.players.get(socket.id);
            if (!player || player.roomId !== roomId) {
                return;
            }

            // Eliminar jugador de la sala
            const playerIndex = room.players.findIndex((p) => p.id === socket.id);
            if (playerIndex !== -1) {
                const isHost = room.hostId === socket.id;
                const playerUsername = player.username;
                room.players.splice(playerIndex, 1);

                // Actualizar información del jugador
                player.roomId = null;
                player.isReady = false;

                // Abandonar la sala en Socket.IO
                socket.leave(roomId);

                console.log(`Jugador ${playerUsername} (${socket.id}) abandonó sala ${roomId}`);

                // Notificar a los demás jugadores
                socket.to(roomId).emit("playerLeft", {
                    playerId: socket.id,
                    username: playerUsername,
                });

                // Si era el anfitrión, asignar un nuevo anfitrión
                if (isHost && room.players.length > 0) {
                    room.hostId = room.players[0].id;

                    // Actualizar el estado del nuevo anfitrión
                    const newHost = room.players[0];
                    newHost.isHost = true;

                    // Notificar el cambio de anfitrión
                    this.io.to(roomId).emit("hostChanged", {
                        playerId: newHost.id,
                        username: newHost.username,
                    });
                }

                // Si no quedan jugadores, eliminar la sala
                if (room.players.length === 0) {
                    this.rooms.delete(roomId);
                    console.log(`Sala ${roomId} eliminada por falta de jugadores`);
                }
            }
        } catch (error) {
            console.error("Error al abandonar sala:", error);
        }
    }

    /**
     * Maneja el evento de mensaje
     * @param {Socket} socket - Socket del cliente
     * @param {Object} data - Datos del evento
     */
    handleMessage(socket, data) {
        try {
            const { roomId, type, data: messageData } = data;

            // Validar datos
            if (!roomId) {
                return socket.emit("error", { message: "Se requiere un ID de sala" });
            }

            // Verificar si la sala existe
            const room = this.rooms.get(roomId);
            if (!room) {
                return socket.emit("error", { message: "La sala no existe" });
            }

            // Verificar si el jugador está en la sala
            const player = this.players.get(socket.id);
            if (!player || player.roomId !== roomId) {
                return socket.emit("error", { message: "No estás en esta sala" });
            }

            // Reenviar el mensaje a todos los jugadores en la sala
            this.io.to(roomId).emit("message", {
                playerId: socket.id,
                username: player.username,
                type: type || "message",
                data: messageData,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            socket.emit("error", { message: "Error al enviar mensaje" });
        }
    }

    /**
     * Maneja el evento de desconexión
     * @param {Socket} socket - Socket del cliente
     */
    handleDisconnect(socket) {
        try {
            console.log(`Cliente desconectado: ${socket.id}`);

            // Obtener información del jugador
            const player = this.players.get(socket.id);
            if (!player) {
                return;
            }

            // Si el jugador estaba en una sala, manejarlo como si abandonara
            if (player.roomId) {
                this.handleLeaveRoom(socket, { roomId: player.roomId });
            }

            // Eliminar información del jugador
            this.players.delete(socket.id);
        } catch (error) {
            console.error("Error al manejar desconexión:", error);
        }
    }

    /**
     * Inicia el servidor
     */
    start() {
        this.server.listen(this.port, () => {
            console.log(`Servidor multiplayer iniciado en puerto ${this.port}`);
        });
    }

    /**
     * Detiene el servidor
     */
    stop() {
        this.server.close(() => {
            console.log("Servidor multiplayer detenido");
        });
    }
}

// Crear instancia del servidor
const multiplayerServer = new MultiplayerServer();

// Iniciar el servidor
multiplayerServer.start();

// Exportar para uso en otros módulos
module.exports = multiplayerServer;