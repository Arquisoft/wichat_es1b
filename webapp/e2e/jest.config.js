module.exports = {
    testMatch: ["**/steps/*.js"],
    testTimeout: 80000,
    setupFilesAfterEnv: ["expect-puppeteer"],
    testPathIgnorePatterns: [
        "/steps/home-without-stats.steps.js",
        "/steps/login.steps.js"
    ]
}