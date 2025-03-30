const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/home-without-stats.feature');

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
    
    // Mock login y estadísticas vacías
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mockedAuthToken');
      localStorage.setItem('username', 'wichat');

      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (url.endsWith('/login') && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ username: 'wichat', token: 'mockedAuthToken' }),
          });
        }
        if (url.endsWith('/user/statistics') && options.method === 'GET') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ sessions: [] }),
          });
        }
        return originalFetch(url, options);
      };
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
