const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

let newString = 'S345_Bs';

jest.mock('axios');

// Reset mocks before all tests
beforeEach(() => {
  axios.get.mockReset();
  axios.post.mockReset();
});

afterAll(() => {
  app.close();
});

describe('Gateway Service', () => {
  const postEndpoints = [
    ['/login', { username: 'user', password: newString }, { token: 'mockedToken' }],
    ['/adduser', { name: 'Alice' }, { userId: 'mockedUserId' }],
    ['/askllm', { prompt: 'Hola' }, { answer: 'mockedAnswer' }],
    ['/configureAssistant', { config: true }, { success: true }],
    ['/configureGame', { settings: 'value' }, { game: 'configured' }],
    ['/startGame', { category: 'Geografía' }, { gameId: 'game123' }],
    ['/save-session', { session: 'data' }, { saved: true }],
  ];

  const getEndpoints = [
    ['/generateQuestion', { question: '¿Capital?' }],
    ['/nextQuestion', { question: '¿Siguiente?' }],
    ['/get-user-sessions/testuser', { sessions: [{ id: 1, score: 90 }] }],
    ['/health', { status: 'OK' }],
    ['/generatedQuestion', {
      question: "¿Cuál es el lugar de la imagen?",
      correctAnswer: "Dinamarca",
      inc_answer_1: "Omán",
      inc_answer_2: "Países Bajos",
      inc_answer_3: "Francia",
      category: "Geografia",
      image: "http://commons.wikimedia.org/wiki/Special:FilePath/Dannebrog.jpg"
    }],
  ];

  describe('POST endpoints', () => {
    postEndpoints.forEach(([route, body, mockData]) => {
      it(`should handle POST ${route}`, async () => {
        axios.post.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).post(route).send(body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });
    });
  });

  describe('GET endpoints', () => {
    getEndpoints.forEach(([route, mockData]) => {
      it(`should handle GET ${route}`, async () => {
        axios.get.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).get(route);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });
    });
  });

  describe('Error handling', () => {
    it('should return error when POST /login fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } }
      });

      const res = await request(app).post('/login').send({});
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return error when POST /adduser fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } }
      });

      const res = await request(app).post('/adduser').send({});
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return error when POST /askllm fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } }
      });

      const res = await request(app).post('/askllm').send({});
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return error when POST /configureAssistant fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } }
      });

      const res = await request(app).post('/configureAssistant').send({});
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return error when GET /generateQuestion fails', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Question error' } }
      });

      const res = await request(app).get('/generateQuestion');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Question error' });
    });

    it('should return 404 for unknown route', async () => {
      const res = await request(app).get('/not-found');
      expect(res.statusCode).toBe(404);
    });
  });
});