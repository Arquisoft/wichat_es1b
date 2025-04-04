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


  test('Usuario sin partidas ve estadísticas recientes', ({ given, when, then }) => {
    
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
        const icon = document.querySelector('[data-testid="QuizIcon"]');
        if (!icon) return false;

        // Get the parent box
        const boxDiv = icon.closest('.MuiBox-root');
        if (!boxDiv) return false;

        // Check that the paragraphs with expected texts exist inside the div
        const paragraphs = boxDiv.querySelectorAll('p');
        const firstParagraphText = paragraphs[0]?.textContent;
        const secondParagraphText = paragraphs[1]?.textContent;

        return (
            firstParagraphText === "No hay datos de sesiones disponibles" &&
            secondParagraphText === "Comienza tu primera partida para ver estadísticas"
        );
      });

      expect(divExists).toBe(true);
    });
  }, 100000);


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

    then('Debera mostrarse unas estadísticas de preguntas correctas e incorrectas', async () => {

      // Wait for specific statistics elements to appear
      await page.waitForSelector('h4.MuiTypography-h4.css-qsdf6e', { visible: true, timeout: 10000 });
      await page.waitForSelector('h4.MuiTypography-h4.css-17231gu', { visible: true, timeout: 10000 });

      const statisticsExist = await page.evaluate(() => {
        // Check for correct answers (5)
        const correctElement = document.querySelector('h4.MuiTypography-h4.css-qsdf6e');
        const correctScore = correctElement && correctElement.textContent === '5';

        // Check for incorrect answers (0)
        const incorrectElement = document.querySelector('h4.MuiTypography-h4.css-17231gu');
        const incorrectScore = incorrectElement && incorrectElement.textContent === '0';

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
