const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

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
    it('should generate a new question on GET /generateQuestion', async () => {
        //jest.setTimeout(15000); //Timeout alto, ya que por el momento tarda en generar todas las preguntas con imágenes que pueden ser pesadas
        const response = await request(app).get('/generateQuestion');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("responseQuestion");
        expect(response.body).toHaveProperty("responseCorrectAnswer");
        expect(response.body).toHaveProperty("responseAnswerOptions");
        expect(response.body).toHaveProperty("responseQuestionImage");
    });

    it('should return a valid image URL on GET /generateQuestion', async () => {
        jest.setTimeout(15000);
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
});