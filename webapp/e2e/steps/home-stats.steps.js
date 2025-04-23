const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/home-stats.feature');
const login = require('./login.js');
const data = require('./addData2DataBase');

let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {

    jest.setTimeout(80000);
  
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();

    setDefaultOptions({ timeout: 60000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      });
  });


  /*test('Usuario sin partidas ve estadísticas recientes', ({ given, when, then }) => {
    
    let username;
    let password;

    given('Un usuario sin partidas jugadas', async () => {
      username = "wichat";
      password= "123456";
      await data.addUserToDatabase(username,password)
    });

    when('Accede al Home', async () => {
      await login.login(page,username, password);
    });

    then('Debera mostrarse un mensaje de "No hay datos de sesiones disponibles"', async () => {
      // Wait for the div with the QuizIcon to appear
      await page.waitForSelector('[data-testid="QuizIcon"]', { visible: true, timeout: 10000 });

      // Verify the div structure exists
      const divExists = await page.evaluate(() => {
        // Find the div that has the QuizIcon and the expected text
        const icon = document.querySelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-1vp4g37 > div.MuiBox-root.css-1wcaknn > div > svg")
        if (!icon) return false;

        // Get the parent box
        const boxDiv = icon.closest('.MuiBox-root');
        if (!boxDiv) return false;

        // Check that the paragraphs with expected texts exist inside the div
        let paragraphs = boxDiv.querySelectorAll('h6');
        const firstParagraphText = paragraphs[0]?.textContent;
        paragraphs = boxDiv.querySelector('p');
        const secondParagraphText = paragraphs.textContent;

        return (
            firstParagraphText === "No hay sesiones de juego registradas" &&
            secondParagraphText === "¡Comienza una nueva partida para ver tus estadísticas aquí!"
        );
      });

      expect(divExists).toBe(true);
    });
  }, 100000);*/


  test('Usuario con partidas ve estadísticas recientes', ({ given, when, then }) => {

    let username;
    let password;

    let questions = [
      {
        "question": "¿Cuál es el lugar de la imagen?",
        "correctAnswer": "Países Bajos",
        "userAnswer": "Países Bajos",
        "_id": "67eeb7d79acd524850506df7"
      },
      {
        "question": "¿Cuál es el lugar de la imagen?",
        "correctAnswer": "Grecia",
        "userAnswer": "Grecia",
        "_id": "67eeb7d79acd524850506df8"
      },
      {
        "question": "¿Cuál es el lugar de la imagen?",
        "correctAnswer": "Noruega",
        "userAnswer": "Noruega",
        "_id": "67eeb7d79acd524850506df9"
      },
      {
        "question": "¿Cuál es el lugar de la imagen?",
        "correctAnswer": "Afganistán",
        "userAnswer": "Afganistán",
        "_id": "67eeb7d79acd524850506dfa"
      },
      {
        "question": "¿Cuál es el lugar de la imagen?",
        "correctAnswer": "Kenia",
        "userAnswer": "Kenia",
        "_id": "67eeb7d79acd524850506dfb"
      }
    ]
    let score = 5;
    let wrongAnswers = 0;

    given('Un usuario con partidas jugadas', async () => {
      username = "wiStats";
      password = "123456";
      await data.addUserToDatabase(username,password);
      await data.saveSessionToDatabase(questions, username, score, wrongAnswers);
    });

    when('Accede al Home', async () => {
      await login.login(page, username, password);
    });

    then('Debera mostrarse unas estadísticas de preguntas correctas e incorrectas, y un raking de jugadores', async () => {

      await page.waitForSelector('h6.MuiTypography-root.MuiTypography-h6.css-1ntayem', { visible: true, timeout: 10000 });
      await page.waitForSelector('p.MuiTypography-root.MuiTypography-body2.css-bxmwoh', { visible: true, timeout: 10000 });
      const statisticsExist = await page.evaluate(() => {
        // First person in the leaderboard
        const correctElement = document.querySelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-8.css-efwuvd > div > div > div > div > div.MuiBox-root.css-i9gxme > h6");
        const correctScore = correctElement && correctElement.textContent === "wiStats";

        // Check for correct Answers (5)
        const incorrectElement =document.querySelector("#root > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.css-58o9ae > div.MuiBox-root.css-1wcaknn > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-8.css-efwuvd > div > div > div > div > div.MuiBox-root.css-i9gxme > div > p:nth-child(2)")
        const incorrectScore = incorrectElement && incorrectElement.textContent === 'Correctas: 5';

        return correctScore && incorrectScore;
      });
      expect(statisticsExist).toBe(true);
    });
  });


  afterEach(async () => {
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    }).catch(() => {});
  })



  afterAll(async () => {
    await browser.close();
  });
});
