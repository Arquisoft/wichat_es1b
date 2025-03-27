const request = require('supertest');
const axios = require('axios');
const fs = require('fs');

// Mock dependencies
jest.mock('axios');
jest.mock('fs');
jest.mock('yaml', () => ({
    parse: jest.fn(() => ({ info: { title: 'Test API' } }))
}));

// Prevent server from actually starting
// This is the key fix for your port conflict issue
const mockServer = {
    close: jest.fn()
};

// Override the app.listen method before requiring the app
const originalListen = require('express/lib/application').listen;
require('express/lib/application').listen = function() {
    // Return mock server instead of binding to a port
    return mockServer;
};

// Now require the app
const app = require('./api-service');

// Restore original method after all tests
afterAll(() => {
    require('express/lib/application').listen = originalListen;
});

describe('API Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /questions/:username', () => {
        it('should return formatted sessions data', async () => {
            // Mock the axios response
            axios.get.mockResolvedValue({ data: [{ _id: '123', score: 5 }] });

            const res = await request(app).get('/questions/testuser');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('sessions');
            expect(res.body.sessions[0]).not.toHaveProperty('_id');
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/get-sessions/testuser'));
        });
    });

    describe('GET /statistics/:username', () => {
        it('should return calculated statistics', async () => {
            axios.get.mockResolvedValue({ data: [{ score: 8, wrongAnswers: 2 }] });

            const res = await request(app).get('/statistics/testuser');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('totalSessions');
            expect(res.body).toHaveProperty('averageScore');
        });
    });

    describe('GET /generatedQuestions', () => {
        it('should return cleaned question data', async () => {
            axios.get.mockResolvedValue({
                data: { questions: [{ _id: '123', question: 'Test?' }] }
            });

            const res = await request(app)
                .get('/generatedQuestions')
                .query({ topic: 'test' });

            expect(res.statusCode).toBe(200);
            expect(res.body.questions[0]).not.toHaveProperty('_id');
        });
    });

    describe('Error handling', () => {
        it('should handle errors from gateway service', async () => {
            axios.get.mockRejectedValue({
                response: { status: 404, data: { error: 'Not found' } }
            });

            const res = await request(app).get('/questions/unknownuser');

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Not found');
        });
    });


    describe('GET /statistics/:username with wrongAnswers', () => {
        it('should handle sessions with undefined wrongAnswers', async () => {
            // Mock sessions with some having undefined wrongAnswers
            axios.get.mockResolvedValue({
                data: [
                    { score: 8, wrongAnswers: 2 },
                    { score: 5 }
                ]
            });

            const res = await request(app).get('/statistics/testuser');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('wrongAnswers');
            expect(res.body).toHaveProperty('averageWrongAnswers');
        });
    });

    describe('GET /generatedQuestions error handling', () => {
        it('should handle non-response errors', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));

            const res = await request(app)
                .get('/generatedQuestions')
                .query({ topic: 'test' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'An error occurred');
        });
    });

    describe('OpenAPI configuration', () => {
        it('should setup Swagger UI when openapi.yaml exists', () => {
            jest.clearAllMocks();

            fs.existsSync.mockReturnValue(true);

            fs.readFileSync.mockReturnValue('swagger: "2.0"');

            jest.isolateModules(() => {
                const originalListen = require('express/lib/application').listen;
                require('express/lib/application').listen = function() {
                    return mockServer;
                };


                require('./api-service');


                require('express/lib/application').listen = originalListen;
            });


            expect(fs.existsSync).toHaveBeenCalledWith('./openapi.yaml');
            expect(fs.readFileSync).toHaveBeenCalledWith('./openapi.yaml', 'utf8');
        });

        // Test for when file doesn't exist
        it('should skip Swagger UI setup when openapi.yaml does not exist', () => {

            jest.clearAllMocks();


            fs.existsSync.mockReturnValue(false);

            const originalConsoleLog = console.log;
            console.log = jest.fn();

            jest.isolateModules(() => {

                const originalListen = require('express/lib/application').listen;
                require('express/lib/application').listen = function() {
                    return mockServer;
                };


                require('./api-service');


                require('express/lib/application').listen = originalListen;
            });


            expect(fs.existsSync).toHaveBeenCalledWith('./openapi.yaml');
            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith("Not configuring OpenAPI. Configuration file not present.");


            console.log = originalConsoleLog;
        });
    });

// Use a spy to test the console.log statements in app.listen
    describe('Server startup logging', () => {
        it('should log server startup messages', () => {
            // Mock console.log to capture output
            const originalConsoleLog = console.log;
            console.log = jest.fn();

            jest.isolateModules(() => {
                // Save the listen callback
                let listenCallback;
                const originalListen = require('express/lib/application').listen;
                require('express/lib/application').listen = function(port, callback) {
                    listenCallback = callback;
                    return mockServer;
                };

                require('./api-service');

                if (typeof listenCallback === 'function') {
                    listenCallback();
                }

                // Restore original listen
                require('express/lib/application').listen = originalListen;
            });

            // Verify the console.log statements were called
            expect(console.log).toHaveBeenCalledWith('API service listening at http://localhost:7000');

            // Restore console.log
            console.log = originalConsoleLog;
        });
    });
});