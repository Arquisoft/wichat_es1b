const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service');
//require('dotenv').config();

afterAll(async () => {
    app.close();
  });


jest.mock('axios');

describe('LLM Service', () => {
  //console.log('LLM Service tests are being executed');

  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.startsWith('https://empathyai.prod.empathy.co')) {
      return Promise.resolve({
        data: {
          choices: [{ message: { content: 'llmanswer' } }]
        }
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  });

  // Test /ask endpoint
  it('the llm should reply', async () => {
    const response = await request(app)
        .post('/askllm')
        .send({ question: 'a question', apiKey: 'apiKey' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

});