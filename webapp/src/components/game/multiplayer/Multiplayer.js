/**
 * Servicio para gestionar la comunicación multiplayer mediante WebSockets
 */
class MultiplayerService {
    static instance = null

    /**
     * Obtiene la instancia singleton del servicio
     * @returns {MultiplayerService}
     */
    static getInstance() {
        if (!MultiplayerService.instance) {
            MultiplayerService.instance = new MultiplayerService()
        }
        return MultiplayerService.instance
    }

    constructor() {
        this.socket = null
        this.userId = null
        this.username = null
        this.currentRoomId = null
        this.isConnected = false
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 2000 // 2 segundos

        this.eventHandlers = {
            onConnect: [],
            onDisconnect: [],
            onRoomJoined: [],
            onPlayerJoined: [],
            onPlayerLeft: [],
            onPlayerReady: [],
            onAllPlayersReady: [],
            onGameStart: [],
            onMessage: [],
            onError: [],
            onReconnecting: [],
            onReconnectFailed: [],
            onHostChanged: [],
            onResultsSent: [], // Añadir este evento
            onPlayerScoreUpdate: [], // Útil para actualizar puntuaciones en tiempo real
            onAllPlayersFinished: [] // Para cuando todos terminan
        }

        this.serverUrl = process.env.REACT_APP_MULTIPLAYER ||"http://localhost:8085" // Cambia esto a la URL de tu servidor
    }

    /**
     * Conecta al servidor WebSocket
     * @param {string} [username] - Nombre de usuario opcional
     * @returns {Promise} - Promesa que se resuelve cuando se conecta
     */
    connect(username) {
        return new Promise((resolve, reject) => {
            // Si ya está conectado, resuelve inmediatamente
            if (this.socket && this.socket.connected) {
                console.log("Ya estás conectado al servidor")
                resolve({ success: true, socketId: this.socket.id })
                return
            }

            // Si está en proceso de conexión, rechaza
            if (this.isConnecting) {
                reject(new Error("Ya hay una conexión en proceso"))
                return
            }

            this.isConnecting = true
            this.username = username || "Usuario"

            // Importar socket.io-client dinámicamente
            import("socket.io-client")
                .then(({ io }) => {
                    // Opciones de conexión
                    const options = {
                        reconnection: true,
                        reconnectionAttempts: this.maxReconnectAttempts,
                        reconnectionDelay: this.reconnectDelay,
                        timeout: 10000,
                        transports: ["websocket", "polling"],
                    }

                    // Crear la conexión Socket.io
                    this.socket = io(this.serverUrl, options)

                    // Configurar eventos de conexión
                    this.socket.on("connect", () => {
                        this.isConnected = true
                        this.isConnecting = false
                        this.reconnectAttempts = 0
                        this.userId = this.socket.id
                        console.log("Conectado al servidor multiplayer con ID:", this.socket.id)
                        this._triggerEvent("onConnect", { socketId: this.socket.id })
                        resolve({ success: true, socketId: this.socket.id })
                    })

                    this.socket.on("connect_error", (error) => {
                        console.error("Error de conexión:", error)
                        this._triggerEvent("onError", { message: "Error al conectar con el servidor" })

                        if (!this.isConnected) {
                            this.isConnecting = false
                            reject(error)
                        }
                    })

                    this.socket.on("disconnect", () => {
                        console.log("Desconectado del servidor multiplayer")
                        this.isConnected = false
                        this._triggerEvent("onDisconnect")
                    })

                    this.socket.on("reconnect_attempt", (attemptNumber) => {
                        console.log(`Intento de reconexión #${attemptNumber}`)
                        this._triggerEvent("onReconnecting", { attempt: attemptNumber })
                    })

                    this.socket.on("reconnect", (attemptNumber) => {
                        console.log(`Reconectado al intento ${attemptNumber}`)
                        this.isConnected = true

                        // Si estabas en una sala, intentar volver a unirte
                        if (this.currentRoomId && this.username) {
                            this.joinRoom(this.currentRoomId, this.username)
                                .then(() => console.log("Reincorporado a la sala después de reconexión"))
                                .catch(err => console.error("Error al reincorporarse a la sala:", err))
                        }

                        this._triggerEvent("onConnect", { socketId: this.socket.id, reconnected: true })
                    })

                    this.socket.on("reconnect_failed", () => {
                        console.log("Falló la reconexión después de todos los intentos")
                        this._triggerEvent("onReconnectFailed")
                    })

                    // Configurar eventos específicos del juego
                    this._setupGameEvents()
                })
                .catch((err) => {
                    console.error("Error al cargar socket.io-client:", err)
                    this.isConnecting = false
                    reject(err)
                })
        })
    }

    /**
     * Desconecta del servidor WebSocket
     */
    disconnect() {
        if (this.socket) {
            // Limpiar la sala actual si existe
            if (this.currentRoomId) {
                this.leaveRoom(this.currentRoomId)
            }

            // Desconectar el socket
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
            this.currentRoomId = null
            console.log("Desconectado del servidor multiplayer")
        }
    }

    /**
     * Solicita preguntas al servidor para una sala específica
     * @param {string} roomId - ID de la sala
     * @param {number} count - Número de preguntas a solicitar (opcional)
     * @param {string} category - Categoría de preguntas (opcional)
     * @returns {Promise} - Promesa que se resuelve con las preguntas recibidas
     */
    requestQuestions(roomId, count = 60, category = "All") {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                return reject(new Error("No estás conectado al servidor"));
            }

            console.log(`Solicitando ${count} preguntas para sala ${roomId}${category ? ` de categoría ${category}` : ''}`);

            // Timeout para la solicitud
            const timeout = setTimeout(() => {
                this.socket.off("questions");
                reject(new Error("Tiempo de espera agotado al solicitar preguntas"));
            }, 10000); // 10 segundos de timeout

            // Configurar manejador para recibir las preguntas
            this.socket.once("questions", (data) => {
                resolve(this._shuffleQuestions(data));
            });

            // Enviar solicitud al servidor
            this.socket.emit("getQuestions", {
                roomId: roomId,
                count: count,
                category: category
            });
        });
    }

    /**
     * Mezcla las opciones de Preguntas
     * @private
     * @param {Array} answers - Array con las Preguntas
     * @returns {Array} - Array mezclado de Preguntas
     */
    _shuffleQuestions(questions) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]]; // Intercambia elementos
        }
        return questions;
    }

    /**
     * Configura los eventos específicos del juego
     * @private
     */
    _setupGameEvents() {
        if (!this.socket) return

        this.socket.on("questions", (data) => {
            console.log("Preguntas recibidas:", data);

            this._triggerEvent("onQuestionsReceived", {
                questions: this._shuffleQuestions(data)
            });
        });

        this.socket.on("playerScoreUpdate", (data) => {
            console.log("Actualización de puntuación de jugador:", data);
            this._triggerEvent("onPlayerScoreUpdate", data);
        });

        this.socket.on("allPlayersFinished", (data) => {
            console.log("Todos los jugadores han terminado el juego:", data);
            this._triggerEvent("onAllPlayersFinished", data);
        });

        // Eventos específicos del juego
        this.socket.on("roomJoined", (data) => {
            // Asegurarnos de que tenemos una estructura de datos consistente
            const roomData = {
                roomId: data.roomId,
                roomName: data.roomName || `Sala ${data.roomId}`,
                isHost: data.isHost || false,
                players: Array.isArray(data.players) ? data.players : [],
                hostId: data.hostId,
            }
            console.log("Unido a sala (datos procesados):", roomData)
            this.currentRoomId = data.roomId
            this._triggerEvent("onRoomJoined", roomData)
        })

        this.socket.on("playerJoined", (data) => {
            // Asegurarnos de que tenemos una estructura de datos consistente
            const playerData = {
                playerId: data.playerId || data.id,
                username: data.username || "Jugador",
                isHost: data.isHost || false,
            }
            console.log("Jugador unido (datos procesados):", playerData)
            this._triggerEvent("onPlayerJoined", playerData)
        })

        this.socket.on("playerLeft", (data) => {
            console.log("Jugador abandonó (datos originales):", data)
            // Asegurarnos de que tenemos una estructura de datos consistente
            const playerData = {
                playerId: data.playerId || data.id,
                username: data.username || "Jugador",
            }
            console.log("Jugador abandonó (datos procesados):", playerData)
            this._triggerEvent("onPlayerLeft", playerData)
        })

        this.socket.on("playerReady", (data) => {
            // Asegurarnos de que tenemos una estructura de datos consistente
            const playerData = {
                playerId: data.playerId || data.id,
                username: data.username || "Jugador",
            }
            this._triggerEvent("onPlayerReady", playerData)
        })

        this.socket.on("allPlayersReady", () => {
            console.log("Todos los jugadores están listos")
            this._triggerEvent("onAllPlayersReady")
        })

        this.socket.on("gameStart", (data) => {
            console.log("Juego iniciado:", data)
            this._triggerEvent("onGameStart", data)
        })

        this.socket.on("message", (data) => {
            console.log("Mensaje recibido:", data)
            this._triggerEvent("onMessage", data)
        })

        this.socket.on("hostChanged", (data) => {
            console.log("Host cambiado:", data)
            this._triggerEvent("onHostChanged", data)
        })

        this.socket.on("error", (data) => {
            console.error("Error del servidor:", data)
            this._triggerEvent("onError", data)
        })
    }

    /**
     * Crea una nueva sala de juego
     * @param {string} roomId - ID de la sala
     * @param {string} roomName - Nombre de la sala
     * @returns {Promise} - Promesa que se resuelve cuando se crea la sala
     */
    async createRoom(roomId, roomName) {
        try {
            console.log(`Creando sala: ${roomId} - ${roomName}`)

            // Asegurar que estamos conectados
            if (!this.isConnected) {
                await this.connect(this.username)
            }

            // Enviar solicitud al servidor para crear la sala
            const response = await fetch(`${this.serverUrl}/createRoom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, roomName }),
            })

            const result = await response.json()
            console.log("Resultado de crear sala:", result)

            if (result.success) {
                //this.sendReady(roomId);
            }

            return result
        } catch (error) {
            console.error("Error al crear sala:", error)
            return { success: false, message: "Error al crear sala: " + error.message }
        }
    }

    /**
     * Une al jugador a una sala existente
     * @param {string} roomId - ID de la sala
     * @param {string} username - Nombre del jugador
     * @returns {Promise} - Promesa que se resuelve cuando el jugador se une a la sala
     */
    joinRoom(roomId, username) {
        return new Promise(async (resolve, reject) => {
            try {
                // Asegurar que estamos conectados
                if (!this.socket || !this.socket.connected) {
                    await this.connect(username)
                }

                this.username = username || this.username || "Anónimo"
                console.log(`Intentando unirse a sala ${roomId} con usuario ${this.username}`)

                // Configurar un manejador de eventos temporal para la respuesta
                const onRoomJoined = (data) => {
                    this.socket.off("roomJoined", onRoomJoined)
                    this.socket.off("error", onError)
                    this.currentRoomId = roomId
                    resolve({ success: true, ...data })
                }

                const onError = (data) => {
                    this.socket.off("roomJoined", onRoomJoined)
                    this.socket.off("error", onError)
                    reject(new Error(data.message || "Error al unirse a la sala"))
                }

                this.socket.once("roomJoined", onRoomJoined)
                this.socket.once("error", onError)

                // Enviar solicitud para unirse a la sala
                this.socket.emit("joinRoom", { roomId, username: this.username })

                // Establecer un tiempo de espera
                setTimeout(() => {
                    this.socket.off("roomJoined", onRoomJoined)
                    this.socket.off("error", onError)
                    reject(new Error("Tiempo de espera agotado al unirse a la sala"))
                }, 10000) // 10 segundos de timeout
            } catch (error) {
                console.error("Error al unirse a sala:", error)
                reject(error)
            }
        })
    }

    /**
     * Marca al jugador como listo para comenzar
     * @param {string} roomId - ID de la sala
     * @returns {boolean} - Verdadero si la solicitud fue enviada
     */
    sendReady(roomId = null) {
        if (!this.socket || !this.socket.connected) {
            console.error("No estás conectado al servidor")
            return false
        }

        const targetRoom = roomId || this.currentRoomId
        if (!targetRoom) {
            console.error("No se especificó una sala")
            return false
        }

        console.log(`Enviando ready para sala ${targetRoom}`)
        this.socket.emit("playerReady", { roomId: targetRoom })
        return true
    }

    /**
     * Inicia el juego (solo para el anfitrión)
     * @param {string} roomId - ID de la sala
     * @returns {boolean} - Verdadero si la solicitud fue enviada
     */
    startGame(roomId = null) {
        if (!this.socket || !this.socket.connected) {
            console.error("No estás conectado al servidor")
            return false
        }

        const targetRoom = roomId || this.currentRoomId
        if (!targetRoom) {
            console.error("No se especificó una sala")
            return false
        }

        this.socket.emit("startGame", { roomId: targetRoom })
        return true
    }

    /**
     * Abandona la sala actual
     * @param {string} roomId - ID de la sala
     * @returns {boolean} - Verdadero si la solicitud fue enviada
     */
    leaveRoom(roomId = null) {
        if (!this.socket || !this.socket.connected) {
            console.error("No estás conectado al servidor")
            return false
        }

        const targetRoom = roomId || this.currentRoomId
        if (!targetRoom) {
            console.error("No estás en ninguna sala")
            return false
        }

        console.log(`Abandonando sala ${targetRoom}`)
        this.socket.emit("leaveRoom", { roomId: targetRoom })

        if (targetRoom === this.currentRoomId) {
            this.currentRoomId = null
        }

        return true
    }

    /**
     * Envía los resultados del juego al servidor
     * @param {string} roomId - ID de la sala
     * @param {Array} correctQuestions - Array de preguntas contestadas correctamente
     * @param {Array} wrongAnswers - Array de preguntas contestadas incorrectamente
     * @param {number} score - Puntuación final
     * @param {number} gameTime - Tiempo total de juego en segundos
     * @returns {Promise} - Promesa que se resuelve cuando los resultados son procesados
     */
    sendGameResults(roomId, correctQuestions, wrongAnswers, score, gameTime) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                return reject(new Error("No estás conectado al servidor"));
            }

            if (!roomId) {
                return reject(new Error("Se requiere un ID de sala"));
            }

            const resultsData = {
                roomId,
                userId: localStorage.getItem("userId"), // Si tienes ID de usuario guardado
                username: localStorage.getItem("username") || "Anónimo",
                score,
                correctQuestions,
                wrongAnswers,
                totalQuestions: correctQuestions.length + wrongAnswers.length,
                gameTime
            };

            console.log("Enviando resultados de juego:", resultsData);

            // Configurar manejador para la confirmación
            this.socket.once("resultsReceived", (response) => {
                if (response.success) {
                    console.log("Resultados enviados correctamente");
                    this._triggerEvent("onResultsSent", response);
                    resolve(response);
                } else {
                    const error = new Error(response.message || "Error al enviar resultados");
                    console.error(error);
                    this._triggerEvent("onError", { message: error.message });
                    reject(error);
                }
            });

            // Enviar los resultados
            this.socket.emit("sendCorrect", resultsData);
        });
    }

    /**
     * Envía un mensaje a todos los jugadores en la sala
     * @param {string} type - Tipo de mensaje
     * @param {Object} data - Datos del mensaje
     * @param {string} roomId - ID de la sala (opcional, usa la sala actual por defecto)
     * @returns {boolean} - Verdadero si el mensaje fue enviado
     */
    sendMessage(type, data, roomId = null) {
        if (!this.socket || !this.socket.connected) {
            console.error("No estás conectado al servidor")
            return false
        }

        const targetRoom = roomId || this.currentRoomId
        if (!targetRoom) {
            console.error("No estás en ninguna sala")
            return false
        }

        console.log(`Enviando mensaje a sala ${targetRoom}:`, { type, data })
        this.socket.emit("message", { roomId: targetRoom, type, data })
        return true
    }

    /**
     * Registra un manejador de eventos
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     * @returns {MultiplayerService} - Instancia para encadenamiento
     */
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler)
        }
        return this
    }

    /**
     * Elimina un manejador de eventos
     * @param {string} event - Nombre del evento
     * @param {Function} [handler] - Función manejadora específica (opcional)
     * @returns {MultiplayerService} - Instancia para encadenamiento
     */
    off(event, handler) {
        if (this.eventHandlers[event]) {
            if (handler) {
                this.eventHandlers[event] = this.eventHandlers[event].filter((h) => h !== handler)
            } else {
                this.eventHandlers[event] = []
            }
        }
        return this
    }

    /**
     * Dispara un evento a todos los manejadores registrados
     * @private
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos del evento
     */
    _triggerEvent(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach((handler) => {
                try {
                    handler(data)
                } catch (error) {
                    console.error(`Error en manejador de evento ${event}:`, error)
                }
            })
        }
    }

    /**
     * Obtiene información sobre la conexión actual
     * @returns {Object} - Información de conexión
     */
    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id,
            currentRoomId: this.currentRoomId,
            username: this.username,
            serverUrl: this.serverUrl,
        }
    }

    /**
     * Obtiene la lista de jugadores en una sala específica
     * @param {string} roomId - ID de la sala
     * @returns {Promise<Object>} - Promesa que se resuelve con la lista de jugadores
     */
    async getPlayersInRoom(roomId = null) {
        try {
            const targetRoom = roomId || this.currentRoomId
            if (!targetRoom) {
                return { success: false, message: "No se especificó una sala", players: [] }
            }

            const response = await fetch(`${this.serverUrl}/rooms/${targetRoom}/players`)
            return await response.json()
        } catch (error) {
            console.error("Error al obtener jugadores:", error)
            return { success: false, message: "Error al obtener jugadores", players: [] }
        }
    }
}

export default MultiplayerService