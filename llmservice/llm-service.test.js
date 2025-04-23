const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service');

afterAll(async () => {
  app.close();
});

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
  beforeEach(() => {
    axios.post.mockImplementation((url, data) => {
      if (url.startsWith('https://empathyai.prod.empathy.co')) {
        // Check if moderation is passed correctly
        const moderationContent = data.messages?.[0]?.content;

        return Promise.resolve({
          data: {
            choices: [{
              message: {
                content: moderationContent === 'Custom moderation'
                    ? 'custom moderated answer'
                    : 'llmanswer'
              }
            }]
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  // Test /askllm endpoint with default moderation
  it('should reply with default moderation', async () => {
    const response = await request(app)
        .post('/askllm')
        .send({ question: 'a question', apiKey: 'apiKey' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  // Test configureAssistant endpoint
  it('should update moderation prompt', async () => {
    const response = await request(app)
        .post('/configureAssistant')
        .send({ moderation: 'Custom moderation' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Moderation prompt updated');
  });

  // Test /askllm with custom moderation
  it('should use custom moderation prompt after configuration', async () => {
    // First configure the custom moderation
    await request(app)
        .post('/configureAssistant')
        .send({ moderation: 'Custom moderation' });

    // Then test the ask endpoint
    const response = await request(app)
        .post('/askllm')
        .send({ question: 'another question', apiKey: 'apiKey' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('custom moderated answer');
  });

  // Test missing required fields
  it('should return error for missing required fields', async () => {
    const response = await request(app)
        .post('/askllm')
        .send({ question: 'a question' }); // Missing apiKey

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required field: apiKey');
  });

  // Test error handling for configureAssistant
  it('should return error when moderation prompt is missing', async () => {
    const response = await request(app)
        .post('/configureAssistant')
        .send({}); // Missing moderation prompt

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing moderation prompt');
  });
});