const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/login.feature');

let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {

    jest.setTimeout(100000);
  
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
    
    // Mock login dentro del navegador
    await page.evaluate(() => {
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (url.endsWith('/login') && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ username: 'wichat', token: 'mockedAuthToken' }),
          });
        }
        return originalFetch(url, options);
      };
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
        { timeout: 100000 }
      );

      const message = await page.$eval('h1', el => el.textContent);

      expect(message).toMatch("WiChat te espera");
    }, 80000);
  });

  afterAll(async () => {
    await browser.close();
  });
});
