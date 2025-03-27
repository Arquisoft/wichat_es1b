const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

//const originEndpoint = REACT_APP_API_ORIGIN_ENDPOINT || 'http://localhost:3000';
const  sessionServiceUrl = process.env.SESSION_SERVICE_URL || 'http://localhost:8005';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const questionsServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';

// const corsOptions = {
//   origin: `${originEndpoint}`, 
//   methods: ['GET', 'POST'], 
//   allowedHeaders: ['Content-Type', 'Authorization'] 
// };

app.use(cors());
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl+'/askllm', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/configureAssistant', async (req, res) => {
    try {
        const response = await axios.post(llmServiceUrl+'/configureAssistant', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
})


app.get('/generateQuestion', async (req, res) => {
  try {
    //Mandar al endpoint del servicio de preguntas para que gestione la petición, con los parámetros añadidos
    //const URL = questionsServiceUrl + 'generateQuestion?user=' + req.query.user + '&category=' + req.query.category;   //codigo completo
    const URL = questionsServiceUrl + '/generateQuestion'; // + '?category=' + req.query.category;     //codigo de prueba
    const response = await axios.get(URL);
    res.json(response.data);
  }
  catch(error) {
    res.status(error.response.status).json({error: error.response.data.error});
  }
});

app.get('/nextQuestion', async (req, res) => {
  try {
    const URL = questionsServiceUrl + '/nextQuestion';
    const response = await axios.get(URL);
    res.json(response.data);
  }
  catch(error) {
    res.status(error.response.status).json({error: error.response.data.error});
  }
});

app.post('/save-session', async (req, res) => {
  try {
    const response = await axios.post(sessionServiceUrl + '/save-session', req.body);   
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get('/get-sessions/:username', async (req, res) => {
  try {
    const response = await axios.get(sessionServiceUrl + '/get-sessions/' + req.params.username);
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});


app.post('/configureGame', async (req, res) => {
  try {
    const response = await axios.post(questionsServiceUrl + '/configureGame', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/startGame', async (req, res) => {
  try {
    const response = await axios.post(questionsServiceUrl + '/startGame', req.body);
    res.json(response.data);
  }
  catch(error) {
    // Check if error.response is defined before accessing its properties
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data.error });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});


app.get('/generatedQuestion', async (req, res) => {
    try {
        const response = await axios.get(questionsServiceUrl + '/generatedQuestion', {
          params: req.query
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
})



// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

app.close = () => {
  server.close();
};

module.exports = server
