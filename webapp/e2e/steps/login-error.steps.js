const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/login-error.feature');

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

    setDefaultOptions({ timeout: 20000 })
  
    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
    
    // 1. Mockear la respuesta del login con credenciales inválidas
    mockAxios.onPost('http://localhost:8001/login').reply(401, {
      message: 'Credenciales inválidas'
    });
  });

  test('El usuario introduce credenciales inválidas', ({ given, when, then }) => {
    
    let username;
    let password;
    let wrongpassword;
    
    given('Un usuario registrado con nombre "wichat" y contraseña "123456"', async () => {
      username = "wichat"
      password = "123456";
      wrongpassword = "aaaaaa";
    });

    when('Rellena el formulario de login con contraseña incorecta y lo envía', async () => {
      await page.waitForSelector('input[name="username"]', { visible: true });
      await page.waitForSelector('input[name="password"]', { visible: true });
      
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', wrongpassword);

      await expect(page).toClick('button', { text: 'Iniciar sesión' });
    });

    then('Debería ver el mensaje "Credenciales inválidas"', async () => {
        await page.waitForSelector('div.MuiSnackbarContent-message', { visible: true, timeout: 20000 });

      const errormessage = await page.$eval('div.MuiSnackbarContent-message', el => el.textContent);
      expect(errormessage).toMatch("Credenciales inválidas");
    });
  }, 80000);

  afterAll(async () => {
    await browser.close();
  });
});
