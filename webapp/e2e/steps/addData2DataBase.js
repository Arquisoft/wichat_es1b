const axios = require("axios");
const mongoose = require('mongoose');
const Question = require('../../../questionservice/question-model');

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
 * @param difficulty
 * @param category
 */
async function saveSessionToDatabase(questions, userId, score, wrongAnswers,difficulty="easy", category="Geografía") {
    try {
        const apiEndpoint = 'http://localhost:8000'; // Define the API endpoint
        const response = await axios.post(`${apiEndpoint}/save-session`, {
            questions: questions,
            userid: userId,
            score: score,
            wrongAnswers: wrongAnswers,
            difficulty: difficulty,
            category: category
        });
        return response.data;
    } catch (error) {
        console.error('Error saving session:', error);
        throw error;
    }
}

/**
 * Add a question to the database
 * @param {string} question - The question text
 * @param {string} correctAnswer - The correct answer
 * @param {Array} wrongAnswers - Array of 3 incorrect answers
 * @param {string} category - Question category
 * @param {string} image - Optional image URL
 * @returns {Promise} - Promise resolving to the created question
 */
async function addQuestion(question, correctAnswer, wrongAnswers, category, image = "") {
    try {
        if (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3) {
            throw new Error("wrongAnswers must be an array with exactly 3 items");
        }

        const uri =  "mongodb://localhost:27017/questionsDb"; // Replace with your MongoDB URI
        await mongoose.connect(uri);

        //const Question = mongoose.model('Questions');

        /*
        const newQuestion = new Question({
            question: question,
            correctAnswer: correctAnswer,
            inc_answer_1: wrongAnswers[0],
            inc_answer_2: wrongAnswers[1],
            inc_answer_3: wrongAnswers[2],

            category: category,
            image: image
        });

        newQuestion.save();
        */

        // Definir los datos
        const questionData = {
            question: question,
            correctAnswer: correctAnswer,
            inc_answer_1: wrongAnswers[0],
            inc_answer_2: wrongAnswers[1],
            inc_answer_3: wrongAnswers[2],
            category: category,
            image: image,
            __v:0
        };


        await mongoose.connection.collection('questions').insertOne(questionData);

        await mongoose.connection.close();


    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
}

// Update the module exports to include the new function
module.exports = {
    addUserToDatabase,
    saveSessionToDatabase,
    addQuestion
};