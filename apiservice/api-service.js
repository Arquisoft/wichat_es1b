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
                questions: questionsWithoutId
            };
        });

        res.json({
            sessions: sessionsFormatted
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'An error occurred'
        });
    }
});


app.get('/statistics/:username', async (req, res) => {
    try {
        const response = await axios.get(apiEndpoint + '/get-sessions/' + req.params.username);
        const sessions = response.data;

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
        const response = await axios.get( apiEndpoint + '/generatedQuestion', {
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
});

app.listen(port, () => {
    console.log(`API service listening at http://localhost:${port}`);
});

module.exports = app;