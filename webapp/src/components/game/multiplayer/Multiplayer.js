/**
 * Servicio para gestionar la comunicación multiplayer mediante WebSockets
 */
class MultiplayerService {
    static instance = null;

    /**
     * Obtiene la instancia singleton del servicio
     * @returns {MultiplayerService}
     */
    static getInstance() {
        if (!MultiplayerService.instance) {
            MultiplayerService.instance = new MultiplayerService();
        }
        return MultiplayerService.instance;
    }

    constructor() {
        this.socket = null;
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
            onError: []
        };
        this.serverUrl = 'http://localhost:8085'; // Cambia esto a la URL de tu servidor
    }

    /**
     * Conecta al servidor WebSocket
     */
    connect() {
        if (this.socket && this.socket.connected) {
            console.log('Ya estás conectado al servidor');
            return;
        }

        // Importar socket.io-client dinámicamente
        import('socket.io-client').then(({ io }) => {
            this.socket = io(this.serverUrl);

            // Configurar eventos básicos
            this.socket.on('connect', () => {
                console.log('Conectado al servidor multiplayer');
                this._triggerEvent('onConnect');
            });

            this.socket.on('disconnect', () => {
                console.log('Desconectado del servidor multiplayer');
                this._triggerEvent('onDisconnect');
            });

            this.socket.on('error', (data) => {
                console.error('Error del servidor:', data);
                this._triggerEvent('onError', data);
            });

            // Eventos específicos del juego
            this.socket.on('roomJoined', (data) => {
                console.log('Unido a sala:', data);
                this._triggerEvent('onRoomJoined', data);
            });

            this.socket.on('playerJoined', (data) => {
                console.log('Jugador unido:', data);
                this._triggerEvent('onPlayerJoined', data);
            });

            this.socket.on('playerLeft', (data) => {
                console.log('Jugador abandonó:', data);
                this._triggerEvent('onPlayerLeft', data);
            });

            this.socket.on('playerReady', (data) => {
                console.log('Jugador listo:', data);
                this._triggerEvent('onPlayerReady', data);
            });

            this.socket.on('allPlayersReady', () => {
                console.log('Todos los jugadores están listos');
                this._triggerEvent('onAllPlayersReady');
            });

            this.socket.on('gameStart', (data) => {
                console.log('Juego iniciado:', data);
                this._triggerEvent('onGameStart', data);
            });

            this.socket.on('message', (data) => {
                console.log('Mensaje recibido:', data);
                this._triggerEvent('onMessage', data);
            });
        }).catch(err => {
            console.error('Error al cargar socket.io-client:', err);
        });
    }

    /**
     * Desconecta del servidor WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Crea una nueva sala de juego
     * @param {string} roomId - ID de la sala
     * @param {string} roomName - Nombre de la sala
     * @returns {Promise} - Promesa que se resuelve cuando se crea la sala
     */
    async createRoom(roomId, roomName) {
        try {
            const response = await fetch(`${this.serverUrl}/createRoom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, roomName })
            });

            return await response.json();
        } catch (error) {
            console.error('Error al crear sala:', error);
            return { success: false, message: 'Error al crear sala' };
        }
    }

    /**
     * Une al jugador a una sala existente
     * @param {string} roomId - ID de la sala
     * @param {string} username - Nombre del jugador
     * @returns {Promise} - Promesa que se resuelve cuando el jugador se une a la sala
     */
    joinRoom(roomId, username) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject(new Error('No estás conectado al servidor'));
                return;
            }

            // Configurar un manejador de eventos temporal para la respuesta
            const onRoomJoined = (data) => {
                this.socket.off('roomJoined', onRoomJoined);
                this.socket.off('error', onError);
                resolve({ success: true, ...data });
            };

            const onError = (data) => {
                this.socket.off('roomJoined', onRoomJoined);
                this.socket.off('error', onError);
                reject(new Error(data.message || 'Error al unirse a la sala'));
            };

            this.socket.once('roomJoined', onRoomJoined);
            this.socket.once('error', onError);

            // Enviar solicitud para unirse a la sala
            this.socket.emit('joinRoom', { roomId, username });

            // Establecer un tiempo de espera
            setTimeout(() => {
                this.socket.off('roomJoined', onRoomJoined);
                this.socket.off('error', onError);
                reject(new Error('Tiempo de espera agotado al unirse a la sala'));
            }, 10000); // 10 segundos de timeout
        });
    }

    /**
     * Marca al jugador como listo para comenzar
     * @param {string} roomId - ID de la sala
     */
    sendReady(roomId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('playerReady', { roomId });
        }
    }

    /**
     * Inicia el juego (solo para el anfitrión)
     * @param {string} roomId - ID de la sala
     */
    startGame(roomId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('startGame', { roomId });
        }
    }

    /**
     * Abandona la sala actual
     * @param {string} roomId - ID de la sala
     */
    leaveRoom(roomId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('leaveRoom', { roomId });
        }
    }

    /**
     * Registra un manejador de eventos
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     * @returns {MultiplayerService} - Instancia para encadenamiento
     */
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
        return this;
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
                this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
            } else {
                this.eventHandlers[event] = [];
            }
        }
        return this;
    }

    /**
     * Dispara un evento a todos los manejadores registrados
     * @private
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos del evento
     */
    _triggerEvent(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error en manejador de evento ${event}:`, error);
                }
            });
        }
    }
}

export default MultiplayerService;