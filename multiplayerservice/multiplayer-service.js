const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and rooms
const clients = new Map();
const rooms = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    const clientId = Date.now().toString();
    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    // Handle messages from client
    ws.on('message', (message) => {
        console.log(`Received from ${clientId}: ${message}`);
        const data = JSON.parse(message);

        // Broadcast the message to all clients
        if (data.type === 'CHAT_MESSAGE') {
            broadcastMessage(data, clientId);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        clients.delete(clientId);
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'CONNECTION_SUCCESS',
        payload: { clientId }
    }));
});

// Broadcast message to all connected clients
function broadcastMessage(data, senderId) {
    const outgoingMessage = JSON.stringify({
        type: 'CHAT_MESSAGE',
        payload: data.payload,
        sender: senderId,
        timestamp: new Date().toISOString()
    });

    clients.forEach((client, id) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(outgoingMessage);
        }
    });
}

app.post("/createRoom", (req, res) => {
    const roomId = req.body.roomId;
    const roomName = req.body.roomName;

    // Create a new room with an empty set of clients
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            name: roomName,
            clients: new Map()
        });
        console.log(`Room created: ${roomId} - ${roomName}`);
    } else {
        console.log(`Room already exists: ${roomId}`);
    }

    res.json({ success: true, roomId, roomName });
});

app.post("/joinRoom", (req, res) => {
    const { clientId, roomId } = req.body;

    if (!rooms.has(roomId)) {
        return res.status(404).json({ success: false, message: "Room not found" });
    }

    const client = clients.get(clientId);
    if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    // Add client to room
    rooms.get(roomId).clients.set(clientId, client);

    // Notify client they joined the room
    client.send(JSON.stringify({
        type: 'JOINED_ROOM',
        payload: { roomId, roomName: rooms.get(roomId).name }
    }));

    res.json({ success: true, roomId });
});

// HTTP endpoint to send message via WebSocket
app.post('/send-message', (req, res) => {
    const message = req.body;

    broadcastMessage({
        type: 'CHAT_MESSAGE',
        payload: { message: message.text }
    }, 'SERVER');

    res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 8085;
server.listen(PORT, () => {
    console.log(`Multiplayer service running on port ${PORT}`);
});