module.exports = {
    testMatch: ["**/steps/*.steps.js"],
    testTimeout: 80000,
    setupFilesAfterEnv: ["expect-puppeteer"],
    testPathIgnorePatterns: [
        "/steps/login.steps.js",
        "/steps/register.steps.js",
        //"/steps/home-stats.steps.js",
        "/steps/game.steps.js",
    ]
}