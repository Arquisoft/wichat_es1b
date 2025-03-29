const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/home-without-stats.feature');

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

    setDefaultOptions({ timeout: 60000 })
  
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

    // Mockear la respuesta de estadísticas (simulando usuario sin partidas jugadas)
    mockAxios.onGet('http://localhost:8005/user/statistics').reply(200, {
      sessions: [], // Simulamos que no hay sesiones de juego
    });

    await page.setCookie({
      name: 'authToken',
      value: 'mockedAuthToken',
      domain: 'localhost', // Esto puede cambiar según el dominio de tu aplicación
      path: '/',
    });

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      });
  });

  test('Usuario sin partidas ve estadisticas recientes', ({ given, when, then }) => {
    
    let username;
    let password;

    given('Un usuario sin partidas jugadas', async () => {
      username = "wichat";
      password= "123456";
    });

    when('Accede al Home', async () => {
      await page.waitForSelector('input[name="username"]', { visible: true });
      await page.waitForSelector('input[name="password"]', { visible: true });

      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);

      await expect(page).toClick('button', { text: 'Iniciar sesión' });
      //await page.waitForSelector('div', { visible: true, timeout: 20000 }); // Esperamos a que cargue la página Home
    });

    then('Deberia mostrarse un mensaje de "No hay datos de sesiones disponibles"', async () => {
      await page.waitForSelector('p', { visible: true, timeout: 100000 });

      const message = await page.$eval('p', el => el.textContent);

      expect(message).toMatch("No hay datos de sesiones disponibles");
    });
  }, 100000);

  afterAll(async () => {
    await browser.close();
  });
});
