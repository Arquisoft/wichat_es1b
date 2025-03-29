const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/register.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {

    jest.setTimeout(80000);
    
    browser = process.env.GITHUB_ACTIONS
          ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
          : await puppeteer.launch({ headless: false, slowMo: 100 });
        page = await browser.newPage();
    setDefaultOptions({ timeout: 10000 });

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('El usuario se registra exitosamente', ({ given, when, then }) => {
    
    let username;
    let password;

    given('Un usuario no registrado', async () => {
      username = "wichat";
      password = "123456";
      await expect(page).toClick("button", { text: "¿No tienes una cuenta? Regístrate aquí." });
    });

    when('Rellena el formulario de registro y lo envía', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toFill('input[name="confirmPassword"]', password);
      await expect(page).toClick('button', { text: 'Crear usuario' });
    });

    then('Debería ver un mensaje de de confirmación', async () => {
      await expect(page).toMatchElement("div", { text: "Usuario añadido correctamente" });
    });
  }, 80000);

  afterAll(async () => {
    await browser.close();
  });
});
