const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/askllm')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }else if (url.endsWith('/configureAssistant')) {
           return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /login endpoint
  it('should forward login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /adduser endpoint
  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/adduser')
      .send({ username: 'newuser', password: 'newpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  // Test /askllm endpoint
  it('should forward askllm request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should configure the assistant with the question', async () => {
      const response = await request(app)
        .post('/askllm')
        .send({ moderation: 'question' });

      expect(response.statusCode).toBe(200);
      expect(response.body.answer).toBe('llmanswer');
    });

    // Test /generateQuestion endpoint
  it('should forward generateQuestion request to question service', async () => {
    axios.get.mockResolvedValueOnce({ data: { question: 'mockedQuestion' } });

    const response = await request(app).get('/generateQuestion');

    expect(response.statusCode).toBe(200);
    expect(response.body.question).toBe('mockedQuestion');
  });

  // Test /nextQuestion endpoint
  it('should forward nextQuestion request to question service', async () => {
    axios.get.mockResolvedValueOnce({ data: { next: 'mockedNextQuestion' } });

    const response = await request(app).get('/nextQuestion');

    expect(response.statusCode).toBe(200);
    expect(response.body.next).toBe('mockedNextQuestion');
  });

  // Test /save-session endpoint
  it('should forward save-session request to session service', async () => {
    axios.post.mockResolvedValueOnce({ data: { saved: true } });

    const response = await request(app)
      .post('/save-session')
      .send({ sessionData: 'data' });

    expect(response.statusCode).toBe(200);
    expect(response.body.saved).toBe(true);
  });

  // Test /get-sessions/:username endpoint
  it('should forward get-sessions request to session service', async () => {
    axios.get.mockResolvedValueOnce({ data: { sessions: ['session1'] } });

    const response = await request(app).get('/get-sessions/testuser');

    expect(response.statusCode).toBe(200);
    expect(response.body.sessions).toContain('session1');
  });

  // Test /configureGame endpoint
  it('should forward configureGame request to question service', async () => {
    axios.post.mockResolvedValueOnce({ data: { game: 'configured' } });

    const response = await request(app)
      .post('/configureGame')
      .send({ settings: 'data' });

    expect(response.statusCode).toBe(200);
    expect(response.body.game).toBe('configured');
  });

  // Test /startGame endpoint
  it('should forward startGame request to question service', async () => {
    axios.post.mockResolvedValueOnce({ data: { started: true } });

    const response = await request(app)
      .post('/startGame')
      .send({ config: 'gameData' });

    expect(response.statusCode).toBe(200);
    expect(response.body.started).toBe(true);
  });

    // Error en /login
    it('should return error when /login fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Unauthorized' } },
      });
  
      const response = await request(app).post('/login').send({});
  
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });
  
    // Error en /adduser
    it('should return error when /adduser fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Bad data' } },
      });
  
      const response = await request(app).post('/adduser').send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Bad data' });
    });
  
    // Error en /askllm
    it('should return error when /askllm fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'LLM failed' } },
      });
  
      const response = await request(app).post('/askllm').send({});
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'LLM failed' });
    });
  
    // Error en /configureAssistant
    it('should return error when /configureAssistant fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Config failed' } },
      });
  
      const response = await request(app).post('/configureAssistant').send({});
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Config failed' });
    });
  
    // Error en /generateQuestion
    it('should return error when /generateQuestion fails', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Bad question' } },
      });
  
      const response = await request(app).get('/generateQuestion');
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Bad question' });
    });
  
    // Error en /nextQuestion
    it('should return error when /nextQuestion fails', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Next failed' } },
      });
  
      const response = await request(app).get('/nextQuestion');
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Next failed' });
    });
  
    // Error en /save-session
    it('should return error when /save-session fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Save failed' } },
      });
  
      const response = await request(app).post('/save-session').send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Save failed' });
    });
  
    // Error en /get-sessions/:username
    it('should return error when /get-sessions fails', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Get sessions failed' } },
      });
  
      const response = await request(app).get('/get-sessions/user123');
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Get sessions failed' });
    });
  
    // Error en /configureGame
    it('should return error when /configureGame fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Configure game failed' } },
      });
  
      const response = await request(app).post('/configureGame').send({});
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Configure game failed' });
    });
  
    // Error en /startGame
    it('should return error when /startGame fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Start failed' } },
      });
  
      const response = await request(app).post('/startGame').send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Start failed' });
    });
  

});