const { Cluster } = require('puppeteer-cluster');
const runIndicator = require('./task');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function init(noOfBrowsers) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: noOfBrowsers,
        puppeteerOptions: {
            timeout: 50_000,
            headless: true,
            defaultViewport: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        retryLimit: 0,
        timeout: 2000000000
    });

    const processStock = async ({ page, data }) => {
        const { tickers } = data;
        try {
            // Set cookies and download behavior once per page session
            await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
            const client = await page.createCDPSession();
            await client.send("Page.setDownloadBehavior", {
                behavior: "allow",
                downloadPath: path.resolve('C:\\Users\\Administrator\\Downloads\\trading-view-v2\\csv'),
            });

            console.log(chalk.green("[NAVIGATING TO TRADINGVIEW CHART]"));
            await page.goto("https://www.tradingview.com/chart/", {
                waitUntil: "load",
                timeout: 0,
            });

            for (const ticker of tickers) {
                if(!ticker.ticker) continue
                console.log(chalk.green("[RUNNING TICKER]: ") + chalk.blue(ticker.ticker) + "\tON CORE " + chalk.yellow(ticker.core))

                const startTime = new Date();
                const maxRetries = 3;

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        await runIndicator(page, ticker.ticker, ticker.status);
                        break; // Exit loop if successful
                    } catch (err) {
                        if (attempt === maxRetries) {
                            console.error(`Failed after ${maxRetries} attempts: ${err.message}`);
                        } else {
                            console.log(`Retrying (${attempt}/${maxRetries}) for ${ticker.ticker}...`);

                            // await page.reload({ waitUntil: ["domcontentloaded"] });
                        }
                    }
                }

                const endTime = new Date();
                console.log(chalk.green("[CHANGED TICKER]: ") + chalk.blue(ticker.ticker) + "\tIN " + chalk.red((endTime - startTime) / 1000) + " sec");

            }
            await delay(1000); 
            await page.close()
        } catch (err) {
            console.error(`Error processing tickers: ${err.message}`);
            await page.close(); // Close page to release resources
            throw err;
        }
    };

    await cluster.task(processStock);
    cluster.on('taskerror', (err, data) => {
        console.error(`Error processing tickers: ${err.message}`);
    });

    return cluster;
}

module.exports = init;