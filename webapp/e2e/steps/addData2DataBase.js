const axios = require("axios");

/**
 * Adds a user to the MongoDB database for testing using Mongoose model
 * @param {string} username - The username
 * @param {string} password - The password
 */
async function addUserToDatabase(username, password) {
    const response = await fetch('http://localhost:8000/adduser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    console.log(response);
    return response.json();
}

/**
 * Saves a game session to the database
 * @param {Array} questions - The session questions
 * @param {string} userId - The user ID
 * @param {number} score - The user's score
 * @param {number} wrongAnswers - Number of wrong answers
 */
async function saveSessionToDatabase(questions, userId, score, wrongAnswers) {
    try {
        const apiEndpoint = 'http://localhost:8000'; // Define the API endpoint
        const response = await axios.post(`${apiEndpoint}/save-session`, {
            questions: questions,
            userid: userId,
            score: score,
            wrongAnswers: wrongAnswers,
        });
        return response.data;
    } catch (error) {
        console.error('Error saving session:', error);
        throw error;
    }
}

// Update the module exports to include the new function
module.exports = {
    addUserToDatabase,
    saveSessionToDatabase
};