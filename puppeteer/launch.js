const { Cluster } = require('puppeteer-cluster');
const runIndicator = require('./task');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { getMostRecentFile, findFilesByTicker } = require('../utils/extractTickerName');
const { processCSV, updateItem } = require('../csv');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function init(noOfBrowsers) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: noOfBrowsers,
        puppeteerOptions: {
            timeout: 50_000,
            headless: false,
            defaultViewport: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        retryLimit: 0,
        timeout: 2000000000
    });

    const processStock = async ({ page, data }) => {
        const { tickers } = data;
        if (!tickers?.length) {
            await page.close()
            return
        }
        try {
            // Set cookies and download behavior once per page session
            await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
            const client = await page.createCDPSession();
            await client.send("Page.setDownloadBehavior", {
                behavior: "allow",
                downloadPath: path.resolve(path.join(__dirname, '../csv')),
            });
            console.log(chalk.green("[NAVIGATING TO TRADINGVIEW CHART]"));
            await page.goto("https://www.tradingview.com/chart/", {
                waitUntil: "load",
                timeout: 0,
            });
            await processTickers(tickers, page, 0, client)
            await delay(1000);

            // console.log("INIT TIME: ")
            // const after = new Date()
            // console.log((after - data.startTime) / 1000)
            await page.close()
        } catch (err) {
            console.error(`Error processing tickers: ${err.message}`);
            await page.close(); // Close page to release resources
            throw err;
        }
    };
    async function processTickers(tickers, page, client) {
        for (const ticker of tickers) {
            if (!ticker.ticker) continue
            console.log(chalk.green("[RUNNING TICKER]: ") + chalk.blue(ticker.ticker))

            const startTime = new Date();
            const maxRetries = 1;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    await runIndicator(page, ticker.ticker, ticker.status, client);
                    const filePaths = findFilesByTicker(ticker.ticker, './csv')
                    const mostRecentFile = getMostRecentFile(filePaths, './csv')
                    mostRecentFile && await processCSV(path.join(__dirname, '../csv', mostRecentFile), ticker)
                    if (ticker.status == 0) {
                        ticker.status == 0 && await updateItem(ticker.ticker, 5)
                    }
                    break; // Exit loop if successful
                } catch (err) {
                    if (attempt === maxRetries) {
                        console.error(`Failed after ${maxRetries} for ticker: ${ticker.ticker} attempts: ${err.message}`);
                    } else {
                        console.log(`Retrying (${attempt}/${maxRetries}) for ${ticker.ticker}...`);

                        // await page.reload({ waitUntil: ["domcontentloaded"] });
                    }
                }
            }
            const endTime = new Date();
            console.log(chalk.green("[CHANGED TICKER]: ") + chalk.blue(ticker.ticker) + "\tIN " + chalk.red((endTime - startTime) / 1000) + " sec");
        }

    }
    await cluster.task(processStock);
    cluster.on('taskerror', (err, data) => {
        console.error(`Error processing tickers: ${err.message}`);
    });

    return cluster;
}

module.exports = init;