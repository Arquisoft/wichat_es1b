const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/login.feature');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const mockAxios = new MockAdapter(axios);

let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {

    jest.setTimeout(80000);
  
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();

    setDefaultOptions({ timeout: 10000 })
  
    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
    
    // Mockear el login del usuario 
    mockAxios.onPost('http://localhost:8001/login').reply(200, {
      username: 'wichat',
      token: 'mockedAuthToken',
    });
  });

  test('El usuario inicia sesión correctamente', ({ given, when, then }) => {
    
    let username;
    let password;
    
    given('Un usuario registrado con nombre "wichat" y contraseña "123456"', async () => {
      username = "wichat"
      password = "123456";
    });

    when('Rellena el formulario de login y lo envía', async () => {
      await page.waitForSelector('input[name="username"]', { visible: true });
      await page.waitForSelector('input[name="password"]', { visible: true });
      
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);

      await expect(page).toClick('button', { text: 'Iniciar sesión' });
    });

    then('Debería ver el mensaje "WiChat te espera"', async () => {
      await page.waitForFunction(
        'document.querySelector("h1") && document.querySelector("h1").textContent.includes("WiChat te espera")',
        { timeout: 10000 }
      );

      const message = await page.$eval('h1', el => el.textContent);

      expect(message).toMatch("WiChat te espera");
    }, 80000);
  });

  afterAll(async () => {
    await browser.close();
  });
});
