async function login(page,username, password) {

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


    await page.click('input[name="username"]', { clickCount: 3 }); // Select all existing text
    await page.keyboard.press('Backspace');
    await page.type('input[name="username"]', username);

    await page.click('input[name="password"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="password"]', password);

    // Replace the line with this

    await page.click('button.MuiButton-containedPrimary');
}

module.exports = { login };