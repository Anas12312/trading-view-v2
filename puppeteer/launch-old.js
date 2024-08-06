const { Cluster } = require('puppeteer-cluster');
const runIndcator = require('./task');
const fs = require('fs')
async function init(headless, length) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: length,
        puppeteerOptions: {
            timeout: 50_000,
            headless, // SF to enable headless feature of the browser
            defaultViewport: false
        }
    });

    await cluster.task(async ({ page, data }) => {
        await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
        await page.goto("https://www.tradingview.com/chart/", {
            waitUntil: "domcontentloaded"
        })

        await runIndcator(page, data.ticker, data.status)
    });

    return cluster
}
module.exports = init