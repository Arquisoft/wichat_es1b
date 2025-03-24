// apiservice/api-service.js
const express = require('express');
const axios = require('axios');
//const mongoose = require('mongoose');

const app = express();
const port = 6000;

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

//const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
//mongoose.connect(mongoUri);

app.get('/questions/:username', async (req, res) => {
    try {
        const response = await axios.get(apiEndpoint + '/get-sessions/' + req.params.username);
        const sessions = response.data;

        let totalScore = 0;
        let totalWrongAnswers = 0;
        const allQuestions = [];

        sessions.forEach(session => {
            // Add to totals
            totalScore += session.score || 0;
            totalWrongAnswers += session.wrongAnswers || 0;

            // Add questions with session info
            if (session.questions && session.questions.length > 0) {
                const questionsWithSessionInfo = session.questions.map(question => ({
                    ...question,
                    sessionDate: session.createdAt
                }));

                allQuestions.push(...questionsWithSessionInfo);
            }
        });

        res.json({
            totalScore,
            totalWrongAnswers,
            questions: allQuestions
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'An error occurred'
        });
    }
});

app.listen(port, () => {
    console.log(`API service listening at http://localhost:${port}`);
});

module.exports = app;