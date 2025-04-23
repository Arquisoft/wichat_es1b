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
    setDefaultOptions({ timeout: 60000 });

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
      username = "wichatRegistro";
      password = "123456";
      await expect(page).toClick("button", { text: "¿No tienes una cuenta? Regístrate aquí." });
    });

    when('Rellena el formulario de registro y lo envía', async () => {
      await fillForm(username, password, password);
    });

    then('Debería ver un mensaje de de confirmación', async () => {
      await expect(page).toMatchElement("div", { text: "Usuario añadido correctamente" });
    });
  }, 80000);


  test('Las contraseñas del usuario no coinciden', ({ given, when, then }) => {

    let username;
    let password1;
    let password2;

    given('Un usuario no registrado', async () => {
      username = "wichatR"
      password1 = "pswd1_123456";
      password2 = "pswd2_123456";
      await expect(page).toClick("button", { text: "¿No tienes una cuenta? Regístrate aquí." });
    });

    when('Rellena el formulario con contraseñas no coincidentes y lo intenta enviar', async () => {
      await  fillForm(username,password1,password2);
    });

    then('Debería mostrarse un mensaje de error', async () => {
      // Check that the "Crear Cuenta" heading exists
      await page.waitForSelector('h1.MuiTypography-h5', { visible: true });
      const headingText = await page.$eval('h1.MuiTypography-h5', el => el.textContent);
      expect(headingText).toBe('Crear Cuenta');
    });
  }, 80000);

  async function fillForm(username,password1,password2) {
    await page.waitForSelector('input[name="username"]', {
      waitUntil: 'networkidle0',
      visible: true,
    }).catch(() => {
      throw new Error('Username field not found or not visible');
    });

    await page.waitForSelector('input[name="password"]', {
      waitUntil: 'networkidle0',
      visible: true,
    }).catch(() => {
      throw new Error('Password field not found or not visible');
    });

    await page.waitForSelector('input[name="confirmPassword"]', {
      waitUntil: 'networkidle0',
      visible: true,
    }).catch(() => {
      throw new Error('Password field not found or not visible');
    });

    // Fill the form using Puppeteer's type method that simulates keyboard input
    await page.click('input[name="username"]', { clickCount: 3 }); // Select all existing text
    await page.keyboard.press('Backspace');
    await page.type('input[name="username"]', username);

    await page.click('input[name="password"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="password"]', password1);

    await page.click('input[name="confirmPassword"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="confirmPassword"]', password2);

    await page.click('button.MuiButton-containedPrimary.MuiButton-colorPrimary');
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
