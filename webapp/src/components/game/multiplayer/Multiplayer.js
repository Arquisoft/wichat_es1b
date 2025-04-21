// webapp/src/components/game/multiplayer/Multiplayer.js
export default class MultiplayerService {
    static instance = null;

    static getInstance(serverUrl = 'ws://localhost:8085') {
        if (!MultiplayerService.instance) {
            MultiplayerService.instance = new MultiplayerService(serverUrl);
        }
        return MultiplayerService.instance;
    }

    constructor(serverUrl = 'ws://localhost:8085') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.clientId = null;
        this.roomId = null;
        this.callbacks = {
            onConnect: () => {},
            onMessage: () => {},
            onRoomJoined: () => {},
            onError: () => {},
            onDisconnect: () => {}
        };

        // Try to restore clientId from localStorage
        this.clientId = localStorage.getItem('mp_clientId');
    }

    connect() {
        // Don't create a new connection if one already exists
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Using existing connection');
            this.callbacks.onConnect();
            return;
        }

        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
            console.log('Connected to multiplayer server');
            this.callbacks.onConnect();
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle specific message types
            if (data.type === 'CONNECTION_SUCCESS') {
                this.clientId = data.payload.clientId;
                // Store clientId for persistence
                localStorage.setItem('mp_clientId', this.clientId);
                console.log(`Received client ID: ${this.clientId}`);
            } else if (data.type === 'JOINED_ROOM') {
                this.roomId = data.payload.roomId;
                localStorage.setItem('mp_roomId', this.roomId);
                this.callbacks.onRoomJoined(data.payload);
            }

            // General message handler
            this.callbacks.onMessage(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.callbacks.onError(error);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from multiplayer server');
            this.callbacks.onDisconnect();
        };
    }

    joinRoom(roomId) {
        if (!this.clientId) {
            console.error('Cannot join room: No client ID yet');
            return Promise.reject(new Error('Not connected'));
        }

        const apiUrl = this.serverUrl.replace('ws:', 'http:');

        return fetch(`${apiUrl}/joinRoom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: this.clientId, roomId })
        })
            .then(response => response.json());
    }

    sendMessage(type, payload) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
        } else {
            console.error('Cannot send message: Socket not connected');
        }
    }

    on(event, callback) {
        if (event in this.callbacks) {
            this.callbacks[event] = callback;
        }
        return this; // For chaining
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}