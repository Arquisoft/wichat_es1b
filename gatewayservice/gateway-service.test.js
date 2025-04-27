const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

const questionsServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004'
const sessionServiceUrl   = process.env.SESSION_SERVICE_URL  || 'http://localhost:8005'


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

  describe('Additional Gateway Service coverage', () => {
    describe('GET /nextQuestion', () => {
      it('should handle GET /nextQuestion without category', async () => {
        const mockData = { question: 'No category' };
        axios.get.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).get('/nextQuestion');
        expect(axios.get).toHaveBeenCalledWith(
            `${questionsServiceUrl}/nextQuestion`
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should handle GET /nextQuestion with category', async () => {
        const mockData = { question: 'With category' };
        axios.get.mockResolvedValueOnce({ data: mockData });
        const res = await request(app)
            .get('/nextQuestion')
            .query({ category: 'Test Cat' });
        expect(axios.get).toHaveBeenCalledWith(
            `${questionsServiceUrl}/nextQuestion?category=Test%20Cat`
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should return error when GET /nextQuestion fails', async () => {
        axios.get.mockRejectedValueOnce({
          response: { status: 400, data: { error: 'Bad Request' } }
        });
        const res = await request(app).get('/nextQuestion');
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Bad Request' });
      });
    });

    describe('POST /save-session', () => {
      it('should handle POST /save-session success', async () => {
        const mockData = { saved: true };
        axios.post.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).post('/save-session').send({ foo: 'bar' });
        expect(axios.post).toHaveBeenCalledWith(
            `${sessionServiceUrl}/save-session`,
            { foo: 'bar' }
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should return error when POST /save-session fails', async () => {
        axios.post.mockRejectedValueOnce({
          response: { status: 500, data: { error: 'Save failed' } }
        });
        const res = await request(app).post('/save-session').send({});
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Save failed' });
      });
    });

    describe('GET /get-user-sessions/:username', () => {
      it('should handle GET /get-user-sessions/:username success', async () => {
        const mockData = { sessions: [1, 2, 3] };
        axios.get.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).get('/get-user-sessions/fooUser');
        expect(axios.get).toHaveBeenCalledWith(
            `${sessionServiceUrl}/get-user-sessions/fooUser`
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should return error when GET /get-user-sessions/:username fails', async () => {
        axios.get.mockRejectedValueOnce({
          response: { status: 404, data: { error: 'Not found' } }
        });
        const res = await request(app).get('/get-user-sessions/fooUser');
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: 'Not found' });
      });
    });

    describe('GET /get-users-totaldatas', () => {
      it('should handle GET /get-users-totaldatas success', async () => {
        const mockData = { total: 42 };
        axios.get.mockResolvedValueOnce({ data: mockData });
        const res = await request(app).get('/get-users-totaldatas');
        expect(axios.get).toHaveBeenCalledWith(
            `${sessionServiceUrl}/get-users-totaldatas`
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should return error when GET /get-users-totaldatas fails', async () => {
        axios.get.mockRejectedValueOnce({
          response: { status: 503, data: { error: 'Service Unavailable' } }
        });
        const res = await request(app).get('/get-users-totaldatas');
        expect(res.statusCode).toBe(503);
        expect(res.body).toEqual({ error: 'Service Unavailable' });
      });
    });

    describe('POST /configureGame', () => {
      it('should handle POST /configureGame success', async () => {
        const mockData = { game: 'ok' };
        axios.post.mockResolvedValueOnce({ data: mockData });
        const res = await request(app)
            .post('/configureGame')
            .send({ setting: 123 });
        expect(axios.post).toHaveBeenCalledWith(
            `${questionsServiceUrl}/configureGame`,
            { setting: 123 }
        );
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
      });

      it('should return error when POST /configureGame fails', async () => {
        axios.post.mockRejectedValueOnce({
          response: { status: 422, data: { error: 'Invalid config' } }
        });
        const res = await request(app).post('/configureGame').send({});
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual({ error: 'Invalid config' });
      });
    });

    describe('POST /startGame error without response', () => {
      it('should return 500 if error.response is undefined', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network down'));
        const res = await request(app).post('/startGame').send({ any: 'thing' });
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'An unexpected error occurred' });
      });
    });
  });
});