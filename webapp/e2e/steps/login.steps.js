const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const axios = require('axios');
const feature = loadFeature('./features/login.feature');
const MockAdapter = require('axios-mock-adapter');
const login = require('./login.js');
const addUser = require('./addData2DataBase.js');

let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {

    const mock = new MockAdapter(axios);
  
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();

    setDefaultOptions({ timeout: 100000 })
  
    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});

  });

  test('El usuario inicia sesión correctamente', ({ given, when, then }) => {
    
    let username;
    let password;
    
    given('Un usuario registrado con nombre "wichat" y contraseña "123456"', async () => {
      username = "wichat"
      password = "123456";
      await addUser.addUserToDatabase(username, password);
    });

    when('Rellena el formulario de login y lo envía', async () => {
      await fillForm(username,password);
    });

    then('Debería ver el mensaje "WiChat te espera"', async () => {
      await page.waitForFunction(
        'document.querySelector("h1") && document.querySelector("h1").textContent.includes("WiChat te espera")',
        { timeout: 100000 }
      );

      const message = await page.$eval('h1', el => el.textContent);

      expect(message).toMatch("WiChat te espera");
    }, 80000);
  });

  test('El usuario introduce credenciales inválidas', ({ given, when, then }) => {

    let username;
    let wrongpassword;

    given('Un usuario registrado con nombre "wichat" y contraseña "123456"', async () => {
      username = "wichat";
      wrongpassword = "aaaaaa";
    });

    when('Rellena el formulario de login con contraseña incorecta y lo envía', async () => {
      await fillForm(username,wrongpassword);
    });

    then('Debería ver el mensaje "Credenciales inválidas"', async () => {
      const loginHeadingExists = await page.evaluate(() => {
        const heading = document.querySelector('h1.MuiTypography-h5');
        return heading && heading.textContent.includes('Iniciar Sesión');
      });
      expect(loginHeadingExists).toBe(true);
    });
  }, 80000);

  async function fillForm(username, password) {
    await login.login(page,username, password);
  }

  afterEach(async () => {
    await page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    }).catch(() => {});
  })

  afterAll(async () => {
    await browser.close();
  });
});
