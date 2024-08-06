const { Cluster } = require('puppeteer-cluster');
const runIndcator = require('./task');
const os = require('os')
const fs = require('fs');
const chalk = require('chalk');
const { findFilesByTicker, getMostRecentFile } = require('../utils/extractTickerName');
const { processCSV } = require('../csv');
async function init(noOfBrowsers) {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: noOfBrowsers,
        puppeteerOptions: {
            timeout: 50_000,
            headless: false, // Enable headless mode
            defaultViewport: false
        },
        retryLimit: 0
    });

    await cluster.task(async ({ page, data }) => {
        await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
        await page.goto("https://www.tradingview.com/chart/", {
            waitUntil: "domcontentloaded"
        })
        let pagee = page
        for (let ticker of data) {
            if (!ticker.ticker) continue
            try {
                const before = new Date()
                console.log(chalk.green("[RUNNING TICKER]: ") + chalk.blue(ticker.ticker) + "\tON CORE " + chalk.yellow(ticker.core))
                await runIndcator(page, ticker.ticker, ticker.status)
                const after = new Date()
                console.log(chalk.green("[CHANGED TICKER]: ") + chalk.blue(ticker.ticker) + "\tIN " + chalk.red((after - before) / 1000) + " sec")
                // const filePaths = findFilesByTicker(ticker.ticker, './csv')
                // const mostRecentFile = getMostRecentFile(filePaths, './csv')
                // mostRecentFile && await processCSV(path.join(__dirname, 'csv', mostRecentFile), ticker)
                // ticker.status == 0 && await updateItem(ticker.ticker, 2)
            } catch (e) {
                console.log(e)
                pagee = await (page.browser().newPage())
                continue
            }
        }
        pagee.close()
    });
    return cluster
}
module.exports = init