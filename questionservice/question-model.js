const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema( {
    question: {
        type: String,
        required: true,
    },

    correctAnswer: {
        type: String,
        required: true,
    },

    inc_answer_1: {
        type: String,
        required: true,
    },

    inc_answer_2: {
        type: String,
        required: true,
    },

    inc_answer_3: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        required: false,
    }

});

const Question = mongoose.model('Questions', questionSchema);

module.exports = Question