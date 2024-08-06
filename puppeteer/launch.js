const { Cluster } = require('puppeteer-cluster');
const runIndcator = require('./task');
const os = require('os')
const fs = require('fs');
const chalk = require('chalk');
const { findFilesByTicker, getMostRecentFile } = require('../utils/extractTickerName');
const { processCSV, updateItem } = require('../csv');
const path = require('path');
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function init(noOfBrowsers) {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: noOfBrowsers,
        puppeteerOptions: {
            timeout: 50_000,
            headless: true, // Enable headless mode
            defaultViewport: false,
        },
        retryLimit: 0
    });

    await cluster.task(async ({ page, data }) => {
        try {
            await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
            const client = await page.createCDPSession();
            await client.send("Page.setDownloadBehavior", {
                behavior: "allow",
                downloadPath: 'C:\\Users\\Administrator\\Downloads\\trading-view-v2\\csv',
            });
            await page.goto("https://www.tradingview.com/chart/", {
                waitUntil: "domcontentloaded"
            })
            // let pagee = page
            console.log(data.queue.map(t => t.ticker))
            for (let ticker of data.queue) {
                if (!ticker.ticker) continue
                try {
                    ticker.status = 2
                    const before = new Date()
                    console.log(chalk.green("[RUNNING TICKER]: ") + chalk.blue(ticker.ticker) + "\tON CORE " + chalk.yellow(ticker.core))
                    await runIndcator(page, ticker.ticker, ticker.status)
                    const after = new Date()
                    console.log(chalk.green("[CHANGED TICKER]: ") + chalk.blue(ticker.ticker) + "\tIN " + chalk.red((after - before) / 1000) + " sec")

                    if (ticker.status == 2) {
                        continue
                    }
                    const filePaths = findFilesByTicker(ticker.ticker, './csv')
                    const mostRecentFile = getMostRecentFile(filePaths, './csv')
                    mostRecentFile && await processCSV(path.join(__dirname, '../csv', mostRecentFile), ticker)
                    if (ticker.status == 0) {
                        ticker.status == 0 && await updateItem(ticker.ticker, 5)
                    }
                } catch (e) {
                    console.log(chalk.red(ticker.ticker))
                    console.log(e)
                    // await (page.browser().newPage())
                }
                await delay(250)
            }
            console.log("TOTAL TIME: ")
            const after = new Date()
            console.log((after - data.startTime) / 1000)
        }catch(e) {
            console.log(e)
        }
        await page.close()
    });
    return cluster
}
module.exports = init