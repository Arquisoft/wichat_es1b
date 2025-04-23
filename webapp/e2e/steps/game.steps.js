const {defineFeature, loadFeature} = require('jest-cucumber');
const puppeteer = require('puppeteer');
const {setDefaultOptions} = require('expect-puppeteer');
const path = require('path');
const feature = loadFeature('./features/game.feature');
const login = require('./login.js');
const data = require('./addData2DataBase');
const axios = require('axios');
const {addQuestion} = require("./addData2DataBase");

let page;
let browser;

defineFeature(feature, test => {
    beforeAll(async () => {
        jest.setTimeout(80000);

        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
            : await puppeteer.launch({headless: false, slowMo: 100});
        page = await browser.newPage();

        setDefaultOptions({timeout: 60000});

        await page.goto("http://localhost:3000", {
            waitUntil: "networkidle0",
        });

        let question = "¿Cuál es el lugar de la imagen siria?"
        let correctAnswer = "Siria"
        let wrongAnswers = ["Kenia", "Vietnam", "Dinamarca"]
        let category = "geografia"
        let image = "http://commons.wikimedia.org/wiki/Special:FilePath/Damascus%2C%20Syria%2C%20Panoramic%20view%20of%20Damascus.jpg"




        await addQuestion(question, correctAnswer, wrongAnswers, category, image)

        question = "¿Cuál es el lugar de la imagen kenia?"
        correctAnswer = "Siria"
        wrongAnswers = ["Kenia", "Vietnam", "Dinamarca"]
        category = "geografia"
        image = "http://commons.wikimedia.org/wiki/Special:FilePath/Damascus%2C%20Syria%2C%20Panoramic%20view%20of%20Damascus.jpg"

        await addQuestion(question, correctAnswer, wrongAnswers, category, image)

        //await axios.put('http://localhost:8000/createQuestions')
    });

    test('Jugador entra en partida', ({given, when, then}) => {

        let username = "testUser";
        let password = "123456";

        given('Un usuario, estando en el menu', async () => {
            await data.addUserToDatabase(username, password);
            await login.login(page, username, password);
        });

        when('Inicia una partida', async () => {
            //Cargaremos la partida en principiante

            await page.waitForSelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-4.css-iln954 > div > button:nth-child(6)");
            await page.waitForSelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-4.css-iln954 > div > button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.MuiButton-colorPrimary.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.MuiButton-colorPrimary.pulse-button.css-hja32l")

            await page.evaluate(async () => {
                //Dificil
                let button = document.querySelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-4.css-iln954 > div > button:nth-child(6)")
                await button.click();
                let dificil = document.querySelector("#difficulty-menu > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.MuiPopover-paper.MuiMenu-paper.css-17roxjl > ul > li:nth-child(3) > div.MuiListItemText-root.css-14rdsw0 > span")
                await dificil.click();

                //Geografia
                button = document.querySelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-4.css-iln954 > div > button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.MuiButton-colorPrimary.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.MuiButton-colorPrimary.pulse-button.css-hja32l")
                await button.click();
                let geografia = document.querySelector("#game-menu > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation3.MuiPopover-paper.MuiMenu-paper.css-17roxjl > ul > li:nth-child(1)")
                await geografia.click();
            })
        });

        then('debera mostrarse la pantalla de preguntas', async () => {



            await page.waitForSelector("#root > div > div > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-d8p7sn > h5", {
                visible: true,
                timeout: 10000
            });

            // Additional verification to ensure we're on the question screen
            const questionVisible = await page.evaluate(() => {
                return document.querySelector("#root > div > div > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-d8p7sn > h5") !== null;
            });

            expect(questionVisible).toBe(true);
        });
    });

    test('Jugador responde correctamente a una pregunta', ({given, when, then}) => {
        given('Un usuario, estando en la pantalla de preguntas', () => {
            //Viene del estado/test anterior
        });

        when('Responde correctamente a una pregunta', async () => {

            expect(await answer("Siria")).toBe(true);

        });

        then('debera mostrarse la respuesta en verde', async () => {

            expect(await correctAnswer()).toBe(true);

        });
    });


    test('Jugador responde incorrectamente a una pregunta', ({given, when, then}) => {
        given('Un usuario, estando en la pantalla de preguntas', () => {
            //Viene del estado/test anterior
        });

        when('Responde incorrectamente a una pregunta', async () => {
            expect(await answer("Kenia")).toBe(true);
        });

        then('debera mostrarse respuesta en rojo y en verde la correcta', async () => {
            expect(await incorrectAnswer("Kenia")).toBe(true);
            expect(await correctAnswer()).toBe(true);
        });
    });


    test('Jugador no responde a la pregunta', ({given, when, then}) => {
        given('Un usuario, estando en la pantalla de preguntas', () => {
            //estado final anterior
        });

        when('No responde a la pregunta', async () => {
            await new Promise(resolve => setTimeout(resolve, 4000));//Esperamos a que acabe el tiempo
        });

        then('debera mostrarse la respuesta correcta en verde', async () => {
            expect(await correctAnswer()).toBe(true);
        });
    });


    test('Jugador usa pista', ({given, when, then}) => {
        given('Un usuario, estando en la pantalla de preguntas', () => {
            //Viene del estado/test anterior
        });

        when('Usa una pista', async () => {
            expect(await openChat()).toBe(true);

            expect(await sendMessage("Dame una pista")).toBe(true);

            await new Promise(resolve => setTimeout(resolve, 10000));
        });

        then('debera quedarse en la misma pantalla de preguntas', () => {
            //Se comprueba que pueda interactuar con el chat, como responde el chat, está testado en su correspondiente test
        });
    });


    afterAll(async () => {
        await browser.close();
    });

    afterEach(async () => {
        // Wait for 4 seconds between tests to allow next question to load
        await new Promise(resolve => setTimeout(resolve, 4000));
    });
});


async function answer(text) {
    try {

        await page.waitForSelector("button", { timeout: 5000 });

        return await page.evaluate((text) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const targetButton = buttons.find(button =>
                button.textContent.includes(text));
            if (targetButton) {
                targetButton.click();
                return true;
            }
            return false;
        }, text);
    } catch (error) {
        console.error(`Error finding button with text "${text}": ${error.message}`);
        return false;
    }
}

async function correctAnswer() {
    await page.waitForSelector(".MuiButton-outlined.MuiButton-outlinedPrimary.css-1vzg8ri");

    return await page.evaluate(() => {
        // Find the button using the unique class selector
        const buttons = document.querySelectorAll(".MuiButton-outlined.MuiButton-outlinedPrimary.css-1vzg8ri");

        if (buttons.length !== 1) {
            return false
        }

        return buttons[0].textContent.includes("Siria");


    });
}
async function incorrectAnswer(text) {
    await page.waitForSelector(".MuiButton-fullWidth.css-218ehm");

    return await page.evaluate((text) => {
        // Find the button using the unique class selector
        const buttons = document.querySelectorAll(".MuiButton-fullWidth.css-218ehm");

        if (buttons.length !== 1) {
            return false
        }

        return buttons[0].textContent.includes(text);


    },text);
}

async function openChat() {
    try {

        return await page.evaluate(async () => {

            const button = document.querySelector('.rcb-toggle-icon');

            button.click();

            return true;
        });

    } catch (error) {
        console.error('Error opening chat:', error.message);
        return false;
    }
}

async function sendMessage(message) {
    return await page.evaluate((message) => {
        const input = document.querySelector('.rcb-chat-input-textarea');
        input.value = message;
        if (input) {
            const send = document.querySelector('.rcb-send-icon');
            send.click();
            return true;
        }
        return false;
    },message)
}

