const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const { setDefaultOptions } = require('expect-puppeteer');
const feature = loadFeature('./features/register-error.feature');

let page;
let browser;

defineFeature(feature, test => {
  beforeAll(async () => {

    jest.setTimeout(80000);

    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage();
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 })

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('Las contraseñas del usuario no coinciden', ({ given, when, then }) => {

    let username;
    let password1;
    let password2;

    given('Un usuario no registrado', async () => {
      username = "wichat"
      password1 = "pswd1_123456";
      password2 = "pswd2_123456";
      await expect(page).toClick("button", { text: "¿No tienes una cuenta? Regístrate aquí." });
    });

    when('Rellena el formulario con contraseñas no coincidentes y lo intenta enviar', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password1);
      await expect(page).toFill('input[name="confirmPassword"]', password2);
      await expect(page).toClick('button', { text: 'Crear usuario' });
    });

    then('Debería mostrarse un mensaje de error', async () => {
        await expect(page).toMatchElement("div", { text: "Error: Las contraseñas no coinciden" });
    });
  }, 80000);

  afterAll(async () => {
    await browser.close();
  });
});