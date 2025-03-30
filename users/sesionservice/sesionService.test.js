const request = require('supertest');
const mongoose = require('mongoose');

// Store route handlers
const routeHandlers = {
    get: {},
    post: {}
};

// Mock server
const mockServer = {
    close: jest.fn(),
    on: jest.fn((event, callback) => {
        if (event === 'close') {
            mockServer.closeCallback = callback;
        }
        return mockServer;
    })
};

// Mock mongoose before requiring any module
jest.mock('mongoose', () => {
    const originalModule = jest.requireActual('mongoose');

    // Create a mock User model with a modifiable findOne function
    const mockUserModel = {
        findOne: jest.fn()
    };

    return {
        ...originalModule,
        connect: jest.fn().mockResolvedValue({}),
        model: jest.fn().mockReturnValue(mockUserModel),
        Schema: originalModule.Schema,
        connection: {
            close: jest.fn()
        }
    };
});

// Mock express
jest.mock('express', () => {
    const app = {
        use: jest.fn(),
        get: jest.fn((path, handler) => {
            routeHandlers.get[path] = handler;
            return app;
        }),
        post: jest.fn((path, handler) => {
            routeHandlers.post[path] = handler;
            return app;
        }),
        listen: jest.fn().mockReturnValue(mockServer)
    };
    const express = jest.fn().mockReturnValue(app);
    express.json = jest.fn();
    return express;
});

// Now require the service
const server = require('./sesionService');

// Restore original methods after tests
afterAll(() => {
    jest.resetModules();
});

describe('Session Service', () => {
    let User;

    beforeEach(() => {
        jest.clearAllMocks();
        // Get a reference to the User model mock
        User = mongoose.model('User');
        // Clear any previous mock implementations
        User.findOne.mockReset();
    });

    describe('GET /health', () => {
        it('should return OK status', async () => {
            const req = {};
            const res = {
                json: jest.fn()
            };

            routeHandlers.get['/health'](req, res);
            expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
        });
    });

    describe('POST /save-session', () => {
        it('should save a session for an existing user', async () => {
            const mockUser = {
                sessions: [],
                save: jest.fn().mockResolvedValue({})
            };

            User.findOne.mockResolvedValue(mockUser);

            const req = {
                body: {
                    userid: 'testuser',
                    score: 85,
                    wrongAnswers: 3,
                    questions: [
                        { question: 'Test question?', correctAnswer: 'Correct', userAnswer: 'Correct' }
                    ]
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.post['/save-session'](req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Session saved successfully' });
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockUser.sessions.length).toBe(1);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 when user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const req = {
                body: { userid: 'nonexistent', score: 75 }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.post['/save-session'](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should handle database errors', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const req = {
                body: { userid: 'testuser', score: 80 }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.post['/save-session'](req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error saving session' });
        });
    });

    describe('GET /get-sessions/:username', () => {
        it('should return sessions for an existing user', async () => {
            const mockSessions = [
                { score: 85, wrongAnswers: 2, questions: [] },
                { score: 90, wrongAnswers: 1, questions: [] }
            ];

            User.findOne.mockResolvedValue({
                username: 'testuser',
                sessions: mockSessions
            });

            const req = {
                params: { username: 'testuser' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-sessions/:username'](req, res);

            expect(res.json).toHaveBeenCalledWith(mockSessions);
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        });

        it('should return 404 when user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const req = {
                params: { username: 'nonexistent' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-sessions/:username'](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should handle database errors', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const req = {
                params: { username: 'testuser' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-sessions/:username'](req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error getting sessions' });
        });
    });

    describe('Server lifecycle', () => {
        it('should close mongoose connection when server closes', () => {
            mockServer.closeCallback();
            expect(mongoose.connection.close).toHaveBeenCalled();
        });
    });
});