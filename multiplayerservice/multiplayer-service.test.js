// multiplayerservice/multiplayer-service.test.js
const request = require('supertest');
const ioClient = require('socket.io-client');
const server = require('./multiplayer-service');

const API_URL = 'http://localhost:8085';

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
});

jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({
        data: {
            questionObject: "Sample question?",
            questionImage: null,
            correctAnswer: "A",
            answerOptions: ["A", "B", "C", "D"]
        }
    }))
}));

describe('MultiplayerServer (integration)', () => {
    let clientSocket1, clientSocket2, clientSocket3;

    beforeAll(() => new Promise((resolve) => setTimeout(resolve, 500)));
    afterEach(() => {
        if (clientSocket1) clientSocket1.disconnect();
        if (clientSocket2) clientSocket2.disconnect();
        if (clientSocket3) clientSocket3.disconnect();
    });

    test('health endpoint returns ok', async () => {
        const res = await request(API_URL).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('can create and fetch a room via HTTP', async () => {
        const roomId = 'room-test-1';
        const res = await request(API_URL)
            .post('/createRoom')
            .send({ roomId, roomName: 'Test Room' });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);

        const getRes = await request(API_URL).get(`/rooms/${roomId}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.room.id).toBe(roomId);
    });

    test('returns 404 for non-existent room', async () => {
        const res = await request(API_URL).get('/rooms/doesnotexist');
        expect(res.statusCode).toBe(404);
    });

    test('returns players in a room', async () => {
        const roomId = 'room-test-players';
        await request(API_URL).post('/createRoom').send({ roomId });
        clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
        await new Promise((resolve) => {
            clientSocket1.on('connect', () => {
                clientSocket1.emit('joinRoom', { roomId, username: 'User1' });
            });
            clientSocket1.on('roomJoined', () => resolve());
        });
        const res = await request(API_URL).get(`/rooms/${roomId}/players`);
        expect(res.statusCode).toBe(200);
        expect(res.body.players[0].username).toBe('User1');
    });

    test('joinRoom with missing data emits error', (done) => {
        clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
        clientSocket1.on('connect', () => {
            clientSocket1.emit('joinRoom', { roomId: '', username: '' });
        });
        clientSocket1.on('error', (data) => {
            expect(data.message).toMatch(/Se requiere un ID de sala/);
            done();
        });
    });

    test('can join a room and receive events via socket.io', (done) => {
        const roomId = 'room-test-2';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId, roomName: 'Socket Room' })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Alice' });
                });
                clientSocket1.on('roomJoined', (data) => {
                    expect(data.roomId).toBe(roomId);
                    expect(data.players[0].username).toBe('Alice');
                    done();
                });
            });
    });

    test('multiple players can join and receive playerJoined event', (done) => {
        const roomId = 'room-test-3';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId, roomName: 'Multi Room' })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                let joinedCount = 0;
                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Bob' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'Carol' });
                });

                clientSocket1.on('playerJoined', (data) => {
                    expect(data.username).toBe('Carol');
                    joinedCount++;
                    if (joinedCount === 1) done();
                });
            });
    });

    test('playerReady and gameStart events', (done) => {
        const roomId = 'room-test-4';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId, roomName: 'Ready Room' })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                let readyCount = 0;

                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Host' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'Guest' });
                });

                clientSocket1.on('roomJoined', () => {});
                clientSocket2.on('roomJoined', () => {
                    clientSocket2.emit('playerReady', { roomId });
                });

                clientSocket1.on('playerReady', (data) => {
                    readyCount++;
                    if (readyCount === 1) {
                        clientSocket1.emit('startGame', { roomId });
                    }
                });

                clientSocket1.on('gameStart', (data) => {
                    expect(data.roomId).toBe(roomId);
                    done();
                });
            });
    });

    test('host leaves and hostChanged event is emitted', (done) => {
        const roomId = 'room-host-leave';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Host' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'Guest' });
                });

                clientSocket2.on('roomJoined', () => {
                    clientSocket1.emit('leaveRoom', { roomId });
                });

                clientSocket2.on('hostChanged', (data) => {
                    expect(data.username).toBe('Guest');
                    done();
                });
            });
    });

    test('player disconnects and playerLeft is emitted', (done) => {
        const roomId = 'room-disconnect';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'User1' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'User2' });
                });

                clientSocket2.on('roomJoined', () => {
                    clientSocket1.disconnect();
                });

                clientSocket2.on('playerLeft', (data) => {
                    expect(data.username).toBe('User1');
                    done();
                });
            });
    });

    test('getQuestions returns questions', (done) => {
        const roomId = 'room-questions';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'UserQ' });
                });
                clientSocket1.on('roomJoined', () => {
                    clientSocket1.emit('getQuestions', { roomId });
                });
                clientSocket1.on('questions', (questions) => {
                    expect(Array.isArray(questions)).toBe(true);
                    expect(questions.length).toBeGreaterThan(0);
                    done();
                });
            });
    });

    test('send and receive chat messages', (done) => {
        const roomId = 'room-chat';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Chatter1' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'Chatter2' });
                });

                clientSocket2.on('roomJoined', () => {
                    clientSocket1.emit('message', { roomId, type: 'chat', data: 'Hello!' });
                });

                clientSocket2.on('message', (msg) => {
                    expect(msg.data).toBe('Hello!');
                    expect(msg.type).toBe('chat');
                    done();
                });
            });
    });

    test('sendCorrect triggers allPlayersFinished', (done) => {
        const roomId = 'room-finish';
        request(API_URL)
            .post('/createRoom')
            .send({ roomId })
            .then(() => {
                clientSocket1 = ioClient(API_URL, { transports: ['websocket'] });
                clientSocket2 = ioClient(API_URL, { transports: ['websocket'] });

                let finishedCount = 0;

                clientSocket1.on('connect', () => {
                    clientSocket1.emit('joinRoom', { roomId, username: 'Finisher1' });
                });
                clientSocket2.on('connect', () => {
                    clientSocket2.emit('joinRoom', { roomId, username: 'Finisher2' });
                });

                clientSocket2.on('roomJoined', () => {
                    clientSocket1.emit('sendCorrect', 5);
                    clientSocket2.emit('sendCorrect', 7);
                });

                clientSocket2.on('allPlayersFinished', (data) => {
                    expect(data.results.length).toBe(2);
                    expect(data.winner).toBe('Finisher2');
                    finishedCount++;
                    if (finishedCount === 1) done();
                });
            });
    });
});

describe('MultiplayerServer error branches', () => {
    let client;

    beforeAll(() => new Promise(res => setTimeout(res, 500)));
    afterEach(() => {
        if (client) client.disconnect();
    });

    // Only stop the server after all tests are complete
    afterAll(done => {
        server.stop();
        setTimeout(done, 500);
    });

    test('POST /createRoom without roomId returns 400', async () => {
        const res = await request(API_URL).post('/createRoom').send({ roomName: 'NoID' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Se requiere un ID de sala/);
    });

    test('POST /createRoom idempotent when exists returns 200 with message', async () => {
        const roomId = 'room-idempotent';
        await request(API_URL).post('/createRoom').send({ roomId });
        const res2 = await request(API_URL).post('/createRoom').send({ roomId });
        expect(res2.statusCode).toBe(200);
        expect(res2.body.message).toBe('La sala ya existe');
        expect(res2.body.roomId).toBe(roomId);
    });

    test('GET /rooms/:roomId returns 404 if missing', async () => {
        const res = await request(API_URL).get('/rooms/nonexistent');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Sala no encontrada');
    });

    test('socket joinRoom with missing data emits error', (done) => {
        client = ioClient(API_URL, { transports: ['websocket'] });

        client.on('error', data => {
            expect(data.message).toMatch(/Se requiere un ID de sala/);
            done();
        });

        client.on('connect', () => {
            client.emit('joinRoom', { roomId: '', username: '' });
        });
    });

    test('socket sendCorrect with no room emits error', (done) => {
        client = ioClient(API_URL, { transports: ['websocket'] });

        client.on('error', data => {
            expect(data.message).toBe('La sala no existe');
            done();
        });

        client.on('connect', () => {
            client.emit('sendCorrect', 10);
        });
    });

    test('socket getQuestions for invalid room emits error', (done) => {
        client = ioClient(API_URL, { transports: ['websocket'] });

        client.on('error', data => {
            expect(data.message).toBe('La sala no existe');
            done();
        });

        client.on('connect', () => {
            client.emit('getQuestions', { roomId: 'bad-room' });
        });
    });

    test('socket getQuestions when player not in room emits error', (done) => {

        const roomJoin = 'room-join-test';
        const roomQuery = 'room-query-test';

        Promise.all([
            request(API_URL).post('/createRoom').send({ roomId: roomJoin }),
            request(API_URL).post('/createRoom').send({ roomId: roomQuery })
        ]).then(() => {
            client = ioClient(API_URL, { transports: ['websocket'] });

            client.on('error', data => {
                if (data.message === 'No estás en esta sala') {
                    done();
                    return;
                }
            });

            client.on('connect', () => {
                client.emit('joinRoom', { roomId: roomJoin, username: 'UserTest' });
            });

            client.on('roomJoined', () => {
                setTimeout(() => {
                    client.emit('getQuestions', { roomId: roomQuery });
                }, 100);
            });
        });
    }, 10000);
});