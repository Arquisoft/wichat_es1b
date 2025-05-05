const axios = require('axios');
const express = require('express');

const app = express();
const port = 8003;
let moderation = "You are a chatbot that must give short hints to the user about the question you will receive. You must always answer in perfect Spanish and give short hints to the user." +
    " It is very important that under no circumstances you give the user the correct answer in your messages. You can not write the correct answer in the hint." +
    " Do not include context like 'here is the hint' or 'I will give you a hint', you must give the hint directly. Your messages should be short and concise, and always in Spanish without gramatical errors." +
    " Your name is Doraemon, and your messages should be short and in Spanish, never in other language that is not Spanish, without any grammatical faults.";

app.use(express.json()); // Middleware para parsear JSON

const llmConfigs = {
  empathy: {
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (question, moderation) => ({
      //model: "qwen/Qwen2.5-Coder-7B-Instruct",
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      stream: false, // No soporta stream=true con axios directamente
      messages: [
        { role: "system", content: moderation },
        { role: "user", content: question }
      ]
    }),
    transformResponse: (response) => response.data.choices?.[0]?.message?.content || "No response",
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

// Validar campos requeridos
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Función genérica para enviar preguntas al LLM
async function sendQuestionToLLM(question, apiKey, moderation) {
  try {
    const config = llmConfigs["empathy"];
    if (!config) {
      throw new Error(`Model is not supported.`);
    }

    const url = config.url();
    const requestData = config.transformRequest(question, moderation);

    const headers = config.headers(apiKey);

    const response = await axios.post(url, requestData, { headers });

    return config.transformResponse(response);

  } catch (error) {
    console.error(`Error sending question:`, error.message || error);
    return "Error processing request.";
  }
}

// Ruta para configurar el prompt del asistente
app.post('/configureAssistant', async (req, res) => {
  if (!req.body.moderation) {
    return res.status(400).json({ error: "Missing moderation prompt" });
  }
  moderation = req.body.moderation;
  res.json({ message: "Moderation prompt updated" });
});

// Ruta para enviar una pregunta
app.post('/askllm', async (req, res) => {
  try {
    validateRequiredFields(req, ['question', 'apiKey']);

    const { question, apiKey } = req.body;
    const answer = await sendQuestionToLLM(question, apiKey, moderation);

    res.json({ answer });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server;
