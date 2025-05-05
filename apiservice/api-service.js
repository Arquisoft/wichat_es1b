// apiservice/api-service.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');


const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8015;

const apiEndpoint = 'http://gatewayservice:8000';

app.use(cors());
app.use(express.json());

//const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
//mongoose.connect(mongoUri);

app.get('/questions/:username', async (req, res) => {
    try {

        const response = await axios.get(apiEndpoint + '/get-user-sessions/' + req.params.username);
        const sessions = response.data.sessions || [];
        console.log(sessions);
        // Transform sessions to remove _id and group questions by session
        const sessionsFormatted = sessions.map(session => {
            // Format questions to remove _id
            const questionsWithoutId = session.questions?.map(question => ({
                question: question.question,
                correctAnswer: question.correctAnswer,
                userAnswer: question.userAnswer
            })) || [];

            // Return session info without _id
            return {
                sessionDate: session.createdAt,
                score: session.score || 0,
                wrongAnswers: session.wrongAnswers || 0,
                questions: questionsWithoutId,
                difficulty: session.difficulty,
                category: session.category
            };
        });

        res.json({
            sessions: sessionsFormatted
        });
    } catch (error) {
        console.log(error)
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'An error occurred'
        });
    }
});


app.get('/statistics/:username', async (req, res) => {
    try {
        const response = await axios.get(apiEndpoint + '/get-user-sessions/' + req.params.username);
        const sessions = response.data.sessions || [];

        const totalSessions = sessions.length;
        const totalScore = sessions.reduce((acc, session) => acc + (session.score || 0), 0);
        const totalWrongAnswers = sessions.reduce((acc, session) => acc + (session.wrongAnswers || 0), 0);

        res.json({
            totalSessions,
            correctAnswers: totalScore,
            wrongAnswers: totalWrongAnswers,
            averageScore: totalScore / totalSessions,
            averageWrongAnswers: totalWrongAnswers / totalSessions
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'An error occurred'
        });
    }
})

app.get('/generatedQuestions', async (req, res) => {
    try {
        const response = await axios.get(apiEndpoint + '/generatedQuestion', {
            params: req.query
        });

        // Helper function to remove __Id and __v fields recursively
        const removeIds = (data) => {
            if (Array.isArray(data)) {
                return data.map(item => removeIds(item));
            } else if (data && typeof data === 'object') {
                const newObj = {};
                for (const key in data) {
                    if (key !== '__Id' && key !== '_id' && key !== '__v') {
                        newObj[key] = removeIds(data[key]);
                    }
                }
                return newObj;
            }
            return data;
        };

        // Transform the response data
        const cleanedData = removeIds(response.data);

        res.json(cleanedData);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'An error occurred'
        });
    }
});

// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
    const file = fs.readFileSync(openapiPath, 'utf8');

    // Parse the YAML content into a JavaScript object representing the Swagger document
    const swaggerDocument = YAML.parse(file);

    // Serve the Swagger UI documentation at the '/api-doc' endpoint
    // This middleware serves the Swagger UI files and sets up the Swagger UI page
    // It takes the parsed Swagger document as input
    app.use('/api-doc', swaggerUi.serve, (req, res, next) => swaggerUi.setup(swaggerDocument)(req, res, next));
} else {
    console.log("Not configuring OpenAPI. Configuration file not present.")
}

app.listen(port, () => {
    console.log(`API service listening at http://localhost:${port}`);
});

module.exports = app;