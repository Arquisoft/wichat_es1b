// Imports
const Question = require('./question-model');
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
global.fetch = require('node-fetch');

const mongoUri = process.env.MONGODB_URI_QUESTIONS || 'mongodb://localhost:27017/questionsDb';
mongoose.connect(mongoUri);


// Constantes
//const {queries:imagesQueries} = require('./question-queries');
const app = express();
const generatorEndpoint = process.env.REACT_APP_API_ORIGIN_ENDPOINT  || "http://localhost:8000";
const port = 8004;
const wikiURL = "https://query.wikidata.org/sparql";
const nOptions = 4;

// Variables
let questions = [];
let currentQuestionIndex = 0;
var maxQuestions = 200;
var usedIndices = new Set();

var randomQuery;
var queries = [];
var shownQuestions = [];
var imagesQueries = {};
imagesQueries["es"] = {
    "Geografia":
        [
            /* pregunta = imagen de un país, opción = nombre del país */
            [
                `
      SELECT DISTINCT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q6256;               
              rdfs:label ?optionLabel;          
        
        OPTIONAL { ?option wdt:P18 ?imageLabel. }    
        FILTER(lang(?optionLabel) = "es")       
        FILTER EXISTS { ?option wdt:P18 ?imageLabel }
      }
      LIMIT ` + maxQuestions, "¿Cuál es el lugar de la imagen?"]
        ],

    "Cultura":
        [
            /* pregunta = imagen monumento, opción = nombre del monumento */
            [
                `
      SELECT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q4989906; 
                  wdt:P17 wd:Q29;                
                  wdt:P18 ?imageLabel.                  
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT ` + maxQuestions, "¿Qué monumento es este?"]
        ],

    "Personajes":
        [
            /* pregunta = imagen de una persona famosa, opción = nombre de la persona */
            [
                `
        SELECT DISTINCT ?option ?optionLabel ?imageLabel
        WHERE {
        ?option wdt:P31 wd:Q5;               # Instance of human
                rdfs:label ?optionLabel;       # Get their label/name
                wdt:P106 ?occupation.          # Has occupation
  
         # Famous occupations filter
         VALUES ?occupation { 
            wd:Q33999   # Actor
            wd:Q177220  # Singer
            wd:Q937857  # Football player
            wd:Q82955   # Politician
            wd:Q36180   # Writer
         }
  
        OPTIONAL { ?option wdt:P18 ?imageLabel. }    
        FILTER(lang(?optionLabel) = "es")       
        FILTER EXISTS { ?option wdt:P18 ?imageLabel }
        }
        LIMIT ` + maxQuestions, "¿Quién es esta persona famosa?"]
        ],


    "Videojuegos":
        [
            /* pregunta = imagen de un videojuego, opción = nombre del videojuego */
            [
                `
      SELECT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q7889;  # Instancia de videojuego
                wdt:P18 ?imageLabel.  # Imagen del videojuego
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT ` + maxQuestions, "¿A qué videojuego pertenece esta imagen?"]
        ],


    "Aviones":
        [
            /* pregunta = imagen de avión, opción = nombre del avión */
            [
                `
    SELECT DISTINCT ?option ?optionLabel ?imageLabel
WHERE {
  ?option wdt:P31 wd:Q15056993;        # Instance of commercial aircraft family or its subclasses
          rdfs:label ?optionLabel.      # Get their label

  OPTIONAL { ?option wdt:P18 ?imageLabel. }  
  FILTER(lang(?optionLabel) IN ("en", "es"))   
  FILTER NOT EXISTS { ?option wdt:P279 wd:Q1518049 }  # Exclude subclasses of Q1518049  
  FILTER EXISTS { ?option wdt:P18 ?imageLabel }
}
LIMIT ` + maxQuestions, "¿Qué avión es este?"]
        ]
}


var language = "es";
var queriesAndQuestions = []; // almacena las queries y las preguntas



var possiblesQuestions = ["¿Cuál es el lugar de la imagen?", "¿Qué monumento es este?", "¿Quién es esta persona famosa?", "¿Qué videojuego es este?", "¿Qué avión es este?", "¿Qué muestra esta imagen?"];
var categories = ["Geografia", "Cultura", "Personajes", "Videojuegos", "Aviones"];//, "All"];
var questionObject = "";
var correctAnswer = "";
var answerOptions = [];
var questionImage = "";


/**
 * Loads the specified number of questions at the beginning of the game.
 * @returns {Promise<void>}
 */
async function loadQuestions(category = "All") {
    questions = [];
    shownQuestions = [];
    currentQuestionIndex = 0;
    queriesAndQuestions = getQueriesAndQuestions(imagesQueries);

    try {
        //let queryPool = queries;
        let questionPrompt = "¿Qué muestra esta imagen?"; // Default question

        await getQueriesByCategory(category);
        let queryPool = queries;

        // Set the question text based on the current category
        const categoryIndex = categories.indexOf(category);

        if (categoryIndex !== -1 && categoryIndex < possiblesQuestions.length) {
            questionPrompt = possiblesQuestions[categoryIndex];
        }

        // Select a random query
        const randomQueryIndex = crypto.randomInt(0, queryPool.length);
        const query = queryPool[randomQueryIndex][0];
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
        console.log("Maxquestions: " + maxQuestions);
        // Initialize a Set to track used images
        const usedImages = new Set();
        let attempts = 0;
        const maxAttempts = Math.min(100, data.length * 2); // Prevent infinite loops

        for (let i = 0; i < maxQuestions; i++) {
            const question = generateQuestionFromData(data, randomQueryIndex);
            question.questionObject = questionPrompt || "¿Qué muestra esta imagen?";

            // Check if this image has already been used
            if (!usedImages.has(question.questionImage)) {
                usedImages.add(question.questionImage);
                questions.push(question);
                attempts = 0; // Reset attempts counter after success
            } else {
                // This is a duplicate, try again
                i--;
                attempts++;

                // Break the loop if we're struggling to find unique questions
                if (attempts >= maxAttempts) {
                    console.log(`Warning: Could only generate ${questions.length} unique questions out of ${maxQuestions} requested`);
                    break;
                }
            }
        }

        console.log(`Successfully loaded ${questions.length} questions for category: ${category || "All"}`);
        return questions;
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

        const question = getQuestionData(response.data.results.bindings);

        const solution = {
            responseQuestion: question.questionObject,
            responseCorrectAnswer: question.correctAnswer,
            responseAnswerOptions: question.answerOptions,
            responseQuestionImage: question.questionImage
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


app.post('/startGame',  async (req, res) => {
    const quest = await getQuestionsByCategory(req.body.category);
    //usedIndices = new Set();
    const category = req.body.category;
    res.status(200).json({
        message: 'Game started',
        category: category || 'All',
        firstQuestion: quest
    });
});




app.get('/nextQuestion', async (req, res) => {
    const question = await getQuestionsByCategory(req.query.category);

    res.status(200).json(question);
});


// Carga de las queries según la categoría
async function getQueriesByCategory(category = "All") {
    if (category === "All" || !category) {
        queries = [];
        for (let cat of categories) {
            if (cat !== "All") {
                queries = queries.concat(queriesAndQuestions["es"][cat]);
            }
        }

        //let rand = crypto.randomInt(0, categories.length);
        //changeQueriesAndQuestions(categories[rand]);
    }
    else {
        if (categories.includes(category)) {
            changeQueriesAndQuestions(category);
            console.log(`Changed queries to category: ${category}, loaded ${queries.length} queries`);
        } else {
            console.warn(`Unknown category: ${category}, using all queries instead`);
            let rand = crypto.randomInt(0, categories.length);
            changeQueriesAndQuestions(categories[rand]);
        }
    }
}

function changeQueriesAndQuestions(category) {
    queries = queriesAndQuestions["es"][category];
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

async function saveQuestions(questions) {
    for (let question of questions) {
        await saveQuestion(question);
    }
}

async function saveQuestion(question) {
    try {
        // Properly await the query
        const existingQuestion = await Question.findOne({ image: question.questionImage });

        if (existingQuestion) {
            console.log("Question with same image already exists:", question.questionImage);
            return null;
        }

        // Get incorrect answers (excluding the correct one)
        const incorrectAnswers = question.answerOptions.filter(
            option => option !== question.correctAnswer
        );

        // Ensure we have exactly 3 incorrect answers
        while (incorrectAnswers.length < 3) {
            incorrectAnswers.push("No disponible");
        }

        // Determine category if not provided
        const category = question.category || getCategoryFromQuestion(question.questionObject);

        // Create new Question document
        const newQuestion = new Question({
            question: question.questionObject,
            correctAnswer: question.correctAnswer,
            inc_answer_1: incorrectAnswers[0],
            inc_answer_2: incorrectAnswers[1],
            inc_answer_3: incorrectAnswers[2],
            category: category,
            image: question.questionImage
        });

        // Save and await the result
        await newQuestion.save();
        console.log("Question saved successfully:", question.questionObject);
    } catch (error) {
        console.error("Error saving question to database:", error);
        return null;
    }
}

app.get('/generatedQuestion', async (req, res) => {
    try {
        let category = req.query.category; // Get category from query parameter

        category=category.toLowerCase();

        // Create a filter object - empty if no category specified
        const filter = category ? { category } : {};

        // Query the database with the filter
        const questions = await Question.find(filter);

        if (questions.length === 0) {
            return res.status(200).json({ message: 'No questions found for the specified criteria' });
        }

        res.status(200).json(questions);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ error: 'Error retrieving questions from database' });
    }
});

app.put('/createQuestions',async (req,res) =>{

    for (const category of categories) {
        console.log(category);
        let questions =  await loadQuestions(category);
        await saveQuestions(questions);
    }

    console.log("Questions created");
    res.status(200).send();

})

// Helper function to determine category from question text
function getCategoryFromQuestion(questionText) {
    if (questionText.includes("lugar")) return "geografia";
    if (questionText.includes("monumento")) return "cultura";
    if (questionText.includes("famosa") || questionText.includes("personaje")) return "personajes";
    if (questionText.includes("avión") || questionText.includes("avion")) return "aviones";
    if (questionText.includes("videojuego")) return "videojuegos";
    return "General";
}

async function getQuestionsByCategory(category) {
    try {
        // Create filter object - empty for "All" or filtered by category
        if(!category) {
            category = "All";
        }

        const filter = category !== "All" ? { category: category.toLowerCase() } : {};

        // Count total matching questions
        const count = await Question.countDocuments(filter);

        if (count === 0) {
            console.log(`No questions found for category: ${category}`);
            return null;
        }

        // Generate random index
        let random;
        do {
            random = Math.floor(Math.random() * count);
        } while (usedIndices.has(random) && usedIndices.size < count);

        usedIndices.add(random);

        // Skip to random position and get one question
        const randomQuestion = await Question.findOne(filter).skip(random);

        return {
            questionObject: randomQuestion.question,
            questionImage: randomQuestion.image,
            correctAnswer: randomQuestion.correctAnswer,
            answerOptions: [
                randomQuestion.correctAnswer,
                randomQuestion.inc_answer_1,
                randomQuestion.inc_answer_2,
                randomQuestion.inc_answer_3
            ].sort(() => Math.random() - 0.5)
        };
    } catch (error) {
        console.error("Error fetching random question:", error);
        throw error;
    }
}


const server = app.listen(port, () => {
    console.log(`Question generator service listening at http://localhost:${port}`);
});

server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
});

module.exports = server;




