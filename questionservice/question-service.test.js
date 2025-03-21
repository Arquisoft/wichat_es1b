const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');

let mongoServer;
let app;

// Mock axios
jest.mock('axios');

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('./question-service');
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('Question Service', () => {
    beforeEach(() => {
        // Mock successful API responses
        axios.mockImplementation(() => {
            return Promise.resolve({
                data: {
                    results: {
                        bindings: [
                            {
                                optionLabel: { value: "Test Option 1" },
                                imageLabel: { value: "https://example.com/image1.jpg" }
                            },
                            {
                                optionLabel: { value: "Test Option 2" },
                                imageLabel: { value: "https://example.com/image2.jpg" }
                            },
                            {
                                optionLabel: { value: "Test Option 3" },
                                imageLabel: { value: "https://example.com/image3.jpg" }
                            },
                            {
                                optionLabel: { value: "Test Option 4" },
                                imageLabel: { value: "https://example.com/image4.jpg" }
                            }
                        ]
                    }
                }
            });
        });
    });

    it('should generate a new question on GET /generateQuestion', async () => {
        const response = await request(app).get('/generateQuestion');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("responseQuestion");
        expect(response.body).toHaveProperty("responseCorrectAnswer");
        expect(response.body).toHaveProperty("responseAnswerOptions");
        expect(response.body).toHaveProperty("responseQuestionImage");
    });

    it('should return a valid image URL on GET /generateQuestion', async () => {
        const response = await request(app).get('/generateQuestion');
        expect(response.status).toBe(200);
        expect(response.body.responseQuestionImage).toMatch(/^https?:\/\/.+/);
    });

    it('should configure the game on POST /configureGame', async () => {
        const response = await request(app).post('/configureGame').send({ valueQuestion: 5 });
        expect(response.status).toBe(200);
        expect(response.body).toBe(5);
    });

    it('should return an error if valueQuestion is not provided on POST /configureGame', async () => {
        const response = await request(app).post('/configureGame').send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Incorrect number of questions');
    });

    // New tests for category functionality
    it('should start a game with no specific category', async () => {
        const response = await request(app).post('/startGame').send({});
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Game started');
        expect(response.body).toHaveProperty('category', 'All');
        expect(response.body).toHaveProperty('firstQuestion');
    });

    it('should start a game with a specific category', async () => {
        const response = await request(app).post('/startGame').send({ category: 'Art' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Game started');
        expect(response.body).toHaveProperty('category', 'Art');
        expect(response.body).toHaveProperty('firstQuestion');
    });

    it('should get the next question after starting a game', async () => {
        // First start a game
        await request(app).post('/startGame').send({});

        // Then get the next question
        const response = await request(app).get('/nextQuestion');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('questionObject');
        expect(response.body).toHaveProperty('questionImage');
        expect(response.body).toHaveProperty('correctAnswer');
        expect(response.body).toHaveProperty('answerOptions');
    });

    it('should return an error when no more questions are available', async () => {
        // Configure game with only 1 question
        await request(app).post('/configureGame').send({ valueQuestion: 1 });

        // Start a game
        await request(app).post('/startGame').send({});

        // Try to get the next question (should fail as there's only 1)
        const response = await request(app).get('/nextQuestion');
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'No more questions');
    });
});