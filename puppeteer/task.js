const puppeteer = require('puppeteer')
const dotenv = require('dotenv');
const { timeout } = require('puppeteer');
const config = require('../config');
dotenv.config();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


const runIndcator = async (page, ticker, mode) => {
    // Change Ticker Name

    async function changeTicker(stockName) {
        try {
            await page.waitForSelector('#header-toolbar-symbol-search')
            const searchBtn = await page.$('#header-toolbar-symbol-search')
            await searchBtn.click({
                delay: 10
            })
            console.log("clicked on search")
            await page.waitForSelector('[data-name="symbol-search-items-dialog"] input')
            await page.type('[data-name="symbol-search-items-dialog"] input', stockName, {
                delay: 5
            })
            await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')
            await page.click('.itemRow-oRSs8UQo div:nth-child(1)')
            console.log("changed ticker name")
        } catch (e) {
            console.log("failed to change ticker name, trying again...")
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
            await page.waitForSelector('[data-name="save-load-menu"]')
            const dropDownBtn = await page.$('[data-name="save-load-menu"]')
            await dropDownBtn.click({
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("clicked on the dropdown button")
            await page.waitForSelector('[data-name="menu-inner"] [data-role="menuitem"]')
            const menuBtn = (await page.$$('[data-name="menu-inner"] [data-role="menuitem"]')).at(5)
            menuBtn.click({
                delay: 100
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("clicked on the menu button")
            await page.waitForSelector("#time-format-select")
            const dropDownButton = (await page.$("#time-format-select"))
            await dropDownButton.click({
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            await page.waitForSelector("#time-format-iso")
            await page.click("#time-format-iso", {
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            console.log("changed time format")
            await page.click("[data-name='submit-button']", {
                delay: 20
            })
            console.log("submitted the downloadCSV dialog")
        } catch (e) {
            console.log("failed to save CSV, trying again...")
            await downloadCSV(page)
        }
    }

    console.log("running the script" + "with mode: " + mode)
    if (mode == 0) {
        await addAllIndicators(page)
        await save(page)
        await changeTicker(ticker, page)
        await addingAlerts(page)
        await save(page)
        await zoomOut(page)
        await downloadCSV(page)
        await delay(2000)
    } else if (mode == 1) {
        await changeTicker(ticker, page)
        await zoomOut(page)
        await downloadCSV(page)
        await delay(2000)
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