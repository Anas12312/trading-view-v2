const puppeteer = require('puppeteer')
const dotenv = require('dotenv');
const { timeout } = require('puppeteer');
const config = require('../config');
const chalk = require('chalk');
const { findFilesByTicker } = require('../utils/extractTickerName');
dotenv.config();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


const runIndcator = async (page, ticker, mode) => {
    // Change Ticker Name

    async function changeTicker(stockName) {
        console.log(page.isClosed())
        try {
            await page.waitForSelector('#header-toolbar-symbol-search', {
                timeout: 1000
            })
            await page.click('#header-toolbar-symbol-search', {
                delay: 10
            })
            console.log("clicked on search")
            await page.waitForSelector('[data-name="symbol-search-items-dialog"] input',{
                timeout: 1000
            })
            await page.type('[data-name="symbol-search-items-dialog"] input', stockName, {
                delay: 10
            })
            await page.waitForSelector('#stocks', {
                timeout: 1000
            })
            await page.click('#stocks', {
                delay: 10
            })
            // await delay(1000)
            await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')
            await page.click('.itemRow-oRSs8UQo div:nth-child(1)', {
                delay: 10
            })
            console.log("changed ticker name")
        } catch (e) {
            console.log(chalk.red(stockName))
            // console.log(e)
            throw(e)
            // return await changeTicker(stockName)
        }
    }

    // Add Indcator


    // await delay(1000) // SF: to remvoe the delay

    // Save Changes
    async function save(page) {
        try {
            await page.click('button#header-toolbar-save-load', {
                delay: 50,
                count: 2
            })
            console.log("saved")
        } catch (e) {
            await delay(200)
            console.log("failed to save, trying again...")
            await save(page)
        }
    }


    // create alert
    async function createAlert(charts, index, page) {
        try {
            const indcatorLegend = charts.at(index);
            await indcatorLegend?.click();
            await delay(50)
            await page.keyboard.down('Alt')
            await page.keyboard.down('A')

            await page.keyboard.up('Alt')
            await page.keyboard.up('A')
            const createAlertBtn = await page.waitForSelector('button[data-name="submit"]', {
                timeout: 1000
            });
            await createAlertBtn.click({
                delay: 50
            });
            console.log("alert created")
        } catch (e) {
            console.log(e)
            console.log("failed to create alert, trying again...")
            await delay(50)
            await createAlert(charts, index, page)
        }
    }
    // More Action Button
    async function addingAlerts(page) {
        await page.waitForSelector("[data-name='legend-source-title']");
        const charts = await page.$$("[data-name='legend-source-title']")
        for (let i in charts) {
            if (i == 0) continue
            await createAlert(charts, i, page)
            await delay(500)
        }
    }


    async function zoomOut(page) {
        await page.keyboard.down('Control')
        await page.keyboard.down('ArrowDown')
        await page.keyboard.up('ArrowDown', {
            delay: 500
        })
        await page.keyboard.up('Control')
    }
    async function downloadCSV(page) {
        try {
            await page.waitForSelector('[data-name="save-load-menu"]', {
                timeout: 1000,
                visible: true
            })
            await page.click('[data-name="save-load-menu"]', {
                delay: 20,
                count: 1
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("clicked on the dropdown button")
            await page.waitForSelector('[data-name="menu-inner"] [data-role="menuitem"]:nth-child(6)', {
                timeout: 1000
            })
            console.log("found the button")
            await page.click('[data-name="menu-inner"] [data-role="menuitem"]:nth-child(6)', {
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("clicked on the menu button")
            await page.waitForSelector("#time-format-select")
            await page.click("#time-format-select", {
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            await page.waitForSelector("#time-format-iso")
            await page.click("#time-format-iso", {
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("changed time format")
            // await page.click("[data-name='submit-button']", {
            //     delay: 20
            // })
            console.log("submitted the downloadCSV dialog")
        } catch (e) {
            // console.log("failed to save CSV, trying again...")
            // console.log(e)
            throw(e)
            // await downloadCSV(page)
        }
    }

    console.log(chalk.cyan("[SCRIPT MODE]: " + mode))
    mode = 2
    if (mode == 0) {
        await changeTicker(ticker, page)
        await addingAlerts(page)
        await downloadCSV(page)
        console.log("Downloading the csv file...")
        while (1) {
            if (findFilesByTicker(ticker, './csv').length) break
        }
        console.log("CSV file downloaded")
    } else if (mode == 1 || mode == 2) {
        await changeTicker(ticker, page)
        // await zoomOut(page)
        await downloadCSV(page)
        // console.log("Downloading the csv file...")
        // let tries = 0
        // while (1) {
        //     if (findFilesByTicker(ticker, './csv').length) break
        //     if(tries == 5) break;
        //     await delay(300)
        //     tries++
        // }
        // console.log("CSV file downloaded")
        // await delay(1000)
        // await save(page)
    }

}
module.exports = runIndcator
// runIndcator(0)
// async function main() {
//     const tickers = ['TSLA', 'AAPL', 'AMZN']
//     for (let ticker of tickers) {
//         await runIndcator(ticker)
//     }
// }
// main()