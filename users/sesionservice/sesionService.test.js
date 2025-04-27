const request = require('supertest');
const mongoose = require('mongoose');

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

// Mock mongoose antes de requerir el servicio
jest.mock('mongoose', () => {
    const originalModule = jest.requireActual('mongoose');

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

// Cargar servicio
const server = require('./sesionService');

afterAll(() => {
    jest.resetModules();
});

describe('Session Service', () => {
    let User;

    beforeEach(() => {
        jest.clearAllMocks();
        User = mongoose.model('User');
        User.findOne.mockReset();
    });

    describe('GET /health', () => {
        it('debería retornar status OK', () => {
            const req = {};
            const res = {
                json: jest.fn()
            };

            routeHandlers.get['/health'](req, res);
            expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
        });
    });

    describe('POST /save-session', () => {
        it('guarda una sesión para un usuario existente', async () => {
            const mockUser = {
                sessions: [],
                TotalWrongAnswers: 2,
                TotalWellAnswers: 5,
                save: jest.fn().mockResolvedValue({})
            };

            User.findOne.mockResolvedValue(mockUser);

            const req = {
                body: {
                    userid: 'testuser',
                    score: 85,
                    wrongAnswers: 3,
                    difficulty: 'easy',
                    category: 'math',
                    questions: [
                        { question: 'Test?', correctAnswer: 'Yes', userAnswer: 'Yes' }
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

        it('retorna 404 si el usuario no existe', async () => {
            User.findOne.mockResolvedValue(null);

            const req = {
                body: {
                    userid: 'nonexistent',
                    score: 75,
                    wrongAnswers: 2,
                    difficulty: 'medium',
                    category: 'science',
                    questions: []
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.post['/save-session'](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('maneja errores de base de datos', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const req = {
                body: {
                    userid: 'testuser',
                    score: 80,
                    wrongAnswers: 1,
                    difficulty: 'hard',
                    category: 'history',
                    questions: []
                }
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

    describe('GET /get-user-sessions/:username', () => {
        it('retorna sesiones de un usuario existente', async () => {
            const mockUser = {
                username: 'testuser',
                sessions: [
                    { score: 85, wrongAnswers: 2, questions: [] },
                    { score: 90, wrongAnswers: 1, questions: [] }
                ]
            };

            User.findOne.mockResolvedValue(mockUser);

            const req = {
                params: { username: 'testuser' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-user-sessions/:username'](req, res);

            expect(res.json).toHaveBeenCalledWith(mockUser);
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        });

        it('retorna 404 si no se encuentra el usuario', async () => {
            User.findOne.mockResolvedValue(null);

            const req = {
                params: { username: 'ghost' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-user-sessions/:username'](req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('maneja errores de base de datos', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const req = {
                params: { username: 'testuser' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await routeHandlers.get['/get-user-sessions/:username'](req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error getting sessions' });
        });
    });

    describe('Cierre del servidor', () => {
        it('debería cerrar la conexión mongoose', () => {
            mockServer.closeCallback();
            expect(mongoose.connection.close).toHaveBeenCalled();
        });
    });

    describe('Validaciones en POST /save-session', () => {
        it('retorna error para distintos errores de userid', async () => {
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // userid no es string (error línea 51)
          await routeHandlers.post['/save-session']({ body: { userid: 123 } }, res);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID format' });
      
          res.status.mockClear();
          res.json.mockClear();
      
          // userid demasiado corto o largo (error línea 57)
          await routeHandlers.post['/save-session']({ body: { userid: ' '.repeat(51) } }, res);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({ error: 'User ID must be between 1 and 50 characters' });
      
          res.status.mockClear();
          res.json.mockClear();
      
          // userid con caracteres no válidos (error línea 63)
          await routeHandlers.post['/save-session']({ body: { userid: 'user invalid' } }, res);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({ error: 'User ID contains invalid characters' });
        });
      });

      describe('GET /get-users-totaldatas', () => {
        it('retorna error si la base de datos falla', async () => {
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
      
          // Simula error al buscar usuarios
          const originalFind = mongoose.model('User').find;
          mongoose.model('User').find = jest.fn().mockRejectedValue(new Error('Database error'));
      
          await routeHandlers.get['/get-users-totaldatas']({}, res);
      
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ error: 'Error getting users' });
      
          mongoose.model('User').find = originalFind; // Restaurar
        });
      });
      
      
});
