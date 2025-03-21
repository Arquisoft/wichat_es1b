// Imports
const Question = require('./question-model');
const Game = require('./game-model');
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
global.fetch = require('node-fetch');


// Constantes
const {queries:imagesQueries} = require('./question-queries');
const app = express();
const generatorEndpoint = process.env.REACT_APP_API_ORIGIN_ENDPOINT  || "http://localhost:8000";
const port = 8004;
const wikiURL = "https://query.wikidata.org/sparql";
const nOptions = 4;

// Variables
let questions = [];
let currentQuestionIndex = 0;
var maxQuestions = 5;

var correct = "";
var question = "";
var image = "";
var gameId = null;
var options = [];
var questionToSave = null;
var gameQuestions = [];
var randomQuery;
var randomIndexes = [];
var queries = [
    `SELECT DISTINCT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q6256;               
              rdfs:label ?optionLabel;          
        
        OPTIONAL { ?option wdt:P18 ?imageLabel. }    
        FILTER(lang(?optionLabel) = "es")       
        FILTER EXISTS { ?option wdt:P18 ?imageLabel }
      } LIMIT 50`,
    `SELECT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q4989906; 
                  wdt:P17 wd:Q29;                
                  wdt:P18 ?imageLabel.                  
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT 50`,
    `SELECT ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P106 wd:Q937857;     
                wdt:P569 ?birthdate.     
        FILTER(YEAR(?birthdate) >= 1970)  
        ?option wdt:P18 ?imageLabel.     
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT 50`
];
var currentNumberOfQuestions = 2;
var language = "es";
var queriesAndQuestions = getQueriesAndQuestions(imagesQueries); // almacena las queries y las preguntas



var possiblesQuestions = ["¿Cuál es el lugar de la imagen?", "¿Qué monumento es este?", "¿Cuál es el nombre de este futbolista?"];
var categories = ["Geografia", "Cultura", "Personajes"];
var questionObject = "";
var correctAnswer = "";
var answerOptions = [];
var questionImage = "";
var numberOfOptions = 4;


/**
 * Loads the specified number of questions at the beginning of the game.
 * @returns {Promise<void>}
 */
async function loadQuestions(category = null) {
    questions = [];
    try {
        // If a specific category is provided, use its queries
        let queryPool = queries;
        let questionPrompt = possiblesQuestions;

        if (category) {
            await getQueriesByCategory(category);
            queryPool = queries;
            // Adjust question prompts according to category
            questionPrompt = possiblesQuestions.filter((_, index) =>
                categories.indexOf(category) === index || index === 0);
        }

        // Select a random query from the filtered pool
        const randomQueryIndex = crypto.randomInt(0, queryPool.length);
        const query = queryPool[randomQueryIndex];
        const url = wikiURL + "?query=" + encodeURIComponent(query) + "&format=json";

        console.log("Fetching questions data for category:", category || "All", "with query type:", randomQueryIndex);

        const response = await axios(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if(!response.data || !response.data.results || response.data.results.bindings.length === 0) {
            console.error("WikiData query did not return any result.");
            throw new Error("No data returned from WikiData");
        }

        const data = response.data.results.bindings;

        // Generate all questions from this single dataset
        for (let i = 0; i < maxQuestions; i++) {
            const question = generateQuestionFromData(data, randomQueryIndex);
            question.questionObject = questionPrompt[categories.indexOf(category)] || "¿Qué muestra esta imagen?";
            questions.push(question);
        }

        console.log(`Successfully loaded ${questions.length} questions for category: ${category || "All"}`);
    }
    catch(error) {
        console.error("Error while loading questions:", error);
        throw error;
    }
}


/**
 * Generates a single question from the provided dataset
 * @param {Array} data - The WikiData query results
 * @param {Number} queryIndex - The index of the query type used
 * @returns {Object} - A question object
 */
function generateQuestionFromData(data, queryIndex) {
    const answerOptions = [];
    const fourRows = [];
    const nElems = data.length;
    const usedIndices = new Set();

    const usedOptions = new Set(); //Avoid duplicates

    // Select unique items for options
    while (fourRows.length < nOptions) {
        let indexRow = crypto.randomInt(0, nElems);

        // Skip if already used or if label is invalid
        if (usedIndices.has(indexRow) ||
            !data[indexRow].optionLabel ||
            data[indexRow].optionLabel.value.startsWith('Q') ||
            !data[indexRow].imageLabel) {
            continue;
        }

        const answerValue = data[indexRow].optionLabel.value;

        //Skip if the option as it is (not the index) has already been added
        if(usedOptions.has(answerValue)) {
            continue;
        }

        usedOptions.add(answerValue);

        usedIndices.add(indexRow);
        fourRows.push(data[indexRow]);
        answerOptions.push(data[indexRow].optionLabel.value);
    }

    const indexQuestion = crypto.randomInt(0, nOptions);

    return {
        questionObject: possiblesQuestions[queryIndex] || "¿Qué muestra esta imagen?",
        questionImage: fourRows[indexQuestion].imageLabel.value,
        correctAnswer: fourRows[indexQuestion].optionLabel.value,
        answerOptions: answerOptions
    };
}




/**
 * Generates a single question <<OLD>>
 * @returns {Promise<Object>}
 */
async function generateQuestion() {
    const randomQuery = crypto.randomInt(0, queries.length);
    const url = wikiURL + "?query=" + encodeURIComponent(queries[randomQuery]) + "&format=json";

    try {
        const response = await axios(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if(!response.data || !response.data.results || response.data.results.bindings.length === 0) {
            console.error("WikiData query did not return any result.");
        }

        return getQuestionData(response.data.results.bindings);
    }
    catch(error) {
        console.error("Error while generating a question: " + error);
        throw error;
    }
}



function getQuestionData(data) {
    const answerOptions = [];
    const fourRows = [];
    const nElems = data.length;

    for (let i = 0; i < nOptions; i++) {
        let indexRow = crypto.randomInt(0, nElems);
        if (!data[indexRow].optionLabel || data[indexRow].optionLabel.value.startsWith('Q') || answerOptions.includes(data[indexRow].optionLabel.value)) {
            i--;
        } else {
            fourRows.push(data[indexRow]);
            answerOptions.push(data[indexRow].optionLabel.value);
        }
    }

    const indexQuestion = crypto.randomInt(0, nOptions);
    return {
        questionObject: possiblesQuestions[randomQuery],
        questionImage: fourRows[indexQuestion].imageLabel.value,
        correctAnswer: fourRows[indexQuestion].optionLabel.value,
        answerOptions: answerOptions
    };

}


app.get('/generateQuestion', async (req, res) => {
    randomQuery = crypto.randomInt(0, queries.length);
    console.log("Selected Query: " + randomQuery);
    const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(queries[randomQuery])}&format=json`;

    try {
        // Makes the petition to the url
        const response = await axios(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log("📢 Respuesta completa de Wikidata:", JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.results || response.data.results.bindings.length === 0) {
            console.error("La consulta a Wikidata no devolvió resultados.");
            return res.status(400).json({ error: 'La consulta no devolvió resultados' });
        }

        // Parse the response
        //const data = await response.json();

        // Send the parsed response to be selected
        getQuestionData(response.data.results.bindings);

        // Declare what will be return
        solution = {
            responseQuestion : questionObject,
            responseCorrectAnswer : correctAnswer,
            responseAnswerOptions : answerOptions,
            responseQuestionImage : questionImage
        };

        //saveQuestion();

        // Return the result with a 200 OK status
        res.status(200).json(solution);
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




//Parser para poder recibir JSON en el body de las peticiones
app.use(bodyParser.json());

//Estructura para poder hacer peticiones desde el Game
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', generatorEndpoint);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})





/**
 * Configuración de las preguntas: asegurarse de que el número de preguntas es correcto y está dentro de los límites establecidos.
 */
app.post('/configureGame', async (req, res) => {
    try {
        maxQuestions = req.body.valueQuestion;
        if(maxQuestions === undefined) {
            throw new Error("Incorrect number of questions");
        }
        res.status(200).json(maxQuestions);
    }
    catch(error) {
        console.log("Error while configuring the game: " + error);
        res.status(400).json({error: error.message});
    }
})


app.post('/startGame', async (req, res) => {
    try {
        const category = req.body.category; // Get category from request
        await loadQuestions(category);
        currentQuestionIndex = 0;
        res.status(200).json({
            message: 'Game started',
            category: category || 'All',
            firstQuestion: questions[currentQuestionIndex]
        });
    } catch (error) {
        console.error("Error starting game:", error);
        res.status(500).json({ error: 'Error starting game: ' + error.message });
    }
});


app.get('/nextQuestion', (req, res) => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        res.status(200).json(questions[currentQuestionIndex]);
    } else {
        res.status(400).json({ error: 'No more questions' });
    }
});


// Carga de las queries según la categoría
async function getQueriesByCategory(category) {
    if (!category || category === "All") {
        queries = getAllValues();
        return;
    }

    if (categories.includes(category)) {
        changeQueriesAndQuestions(category);
        console.log(`Changed queries to category: ${category}, loaded ${queries.length} queries`);
    } else {
        console.warn(`Unknown category: ${category}, using all queries instead`);
        queries = getAllValues();
    }
}

function changeQueriesAndQuestions(category) {
    queries = queriesAndQuestions["es"][category];
}

function getAllValues() {
    var data = [];
    for (var category in queriesAndQuestions) {
        var categoryQueries = queriesAndQuestions[category];
        if (categoryQueries[language]) {
            data = data.concat(categoryQueries[language]);
        }
    }
    return data;
}


// Carga las queries y las preguntas de question-queries.js
function getQueriesAndQuestions(images) {
    var data = {};
    for (var language in images) {
        if (!data[language]) {
            data[language] = {};
        }
        var categoryQuery = images[language];
        for (var category in categoryQuery) {
            if (!data[language][category]) {
                data[language][category] = [];
            }
            data[language][category] = categoryQuery[category];
        }
    }
    return data;
}



function processData(data) {

    options = []; //Reset options
    data = data.results.bindings;
    randomIndexes = [];
    var optionsSelected = [];

    //Obtener cuatro índices aleatorios sin repeticiones
    while (randomIndexes.length < nOptions) {
        var i = crypto.randomInt(0, data.length);
        var opt = data[i].optionLabel.value;
        var quest = "";

        // Se comprueba que la opción no esté repetida, y que no sea una entidad de Wikidata ni un enlace
        if (!randomIndexes.includes(i) && (quest === "" || (!(opt.startsWith("Q") || opt.startsWith("http"))
            && !(quest.startsWith("Q") || quest.startsWith("http")))) && !optionsSelected.includes(opt)) {
            randomIndexes.push(i);
            optionsSelected.push(opt);
        }
    }

    // Seleccionar un índice aleatorio para la opción correcta
    var correctIndex = crypto.randomInt(0, nOptions);
    correct = data[randomIndexes[correctIndex]].optionLabel.value;

    question = queries[0][1];
    image = data[randomIndexes[correctIndex]].imageLabel.value;

    // Mezclar opciones
    for(var i = 0; i < nOptions; i++) {
        var optionIndex = randomIndexes[i];
        var option = data[optionIndex].optionLabel.value;
        options.push(option);
    }
}



async function saveData() {
    try {
        var falseOptions = options.filter(o => o !== correct);

        const newQuestion = new Question({
            question: question,
            correctAnswer: correct,
            inc_answer_1: falseOptions[0],
            inc_answer_2: falseOptions[1],
            inc_answer_3: falseOptions[2],
        });

        await newQuestion.save();

        questionToSave = newQuestion;

        return newQuestion._id;
    }
    catch(error) {
        console.error("Error while saving a new question: " + error);
    }
}


const server = app.listen(port, () => {
    console.log(`Question generator service listening at http://localhost:${port}`);
});

module.exports = server;




