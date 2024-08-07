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
    });

    const processStock = async ({ page, data }) => {
        const { tickers } = data;
        const browser = page.browser()
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
            // for(let i = 0;i<3;i++) {
            //     try {
            //         await page.waitForSelector("sadasdasd", {
            //             timeout: 10000
            //         })
            //     } catch(e) {
            //         console.log("amas")
            //     }
            // }
            for (const ticker of tickers) {
                console.log(chalk.green("[RUNNING TICKER]: ") + chalk.blue(ticker.ticker) + "\tON CORE " + chalk.yellow(ticker.core))

                const startTime = new Date();

                try {
                    await runIndicator(page, ticker.ticker, ticker.status);
                } catch (err) {
                    console.error(`Failed`);
                }

                const endTime = new Date();
                console.log(chalk.green("[CHANGED TICKER]: ") + chalk.blue(ticker.ticker) + "\tIN " + chalk.red((endTime - startTime) / 1000) + " sec");

                await delay(250); // Delay between processing tickers
            }
        } catch (err) {
            console.error(`Error processing tickers: ${err.message}`);
            // await page.close(); // Close page to release resources
            // throw err;
        }
    };

    await cluster.task(processStock);
    cluster.on('taskerror', (err, data) => {
        console.error(`Error processing tickers: ${err.message}`);
    });

    return cluster;
}

module.exports = init;