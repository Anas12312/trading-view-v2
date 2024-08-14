const puppeteer = require('puppeteer')
const dotenv = require('dotenv');
const { timeout } = require('puppeteer');
const config = require('../config');
const chalk = require('chalk');
const { findFilesByTicker } = require('../utils/extractTickerName');
const path = require('path')
dotenv.config();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


const runIndcator = async (page, ticker, mode, client) => {
    // Change Ticker Name

    async function changeTicker(stockName) {
        // console.log(page.isClosed())
        try {
            await page.waitForSelector('#header-toolbar-symbol-search', {
                timeout: 10000
            })
            await page.click('#header-toolbar-symbol-search', {
                delay: 10
            })
            console.log("clicked on search")
            await page.waitForSelector('[data-name="symbol-search-items-dialog"] input', {
                timeout: 10000
            })
            await page.type('[data-name="symbol-search-items-dialog"] input', stockName, {
                delay: 25
            })
            await delay(1000)
            // await page.waitForSelector('#stocks', {
            //     timeout: 10000
            // })
            // await page.click('#stocks', {
            //     delay: 10
            // })
            // await delay(1000)
            await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo', {
                timeout: 10000
            })
            await page.click('.itemRow-oRSs8UQo div:nth-child(1)', {
                delay: 10
            })
            console.log("changed ticker name")
        } catch (e) {
            console.log(chalk.red(stockName))
            // console.log(e)
            throw (e)
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
    async function createAlert(charts, index, page, indicator) {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const indcatorLegend = charts.at(index);
                await indcatorLegend?.click();
                await delay(150)
                await page.keyboard.down('Alt')
                await page.keyboard.down('A')

                await page.keyboard.up('Alt')
                await page.keyboard.up('A')
                const createAlertBtn = await page.waitForSelector('button[data-name="submit"]', {
                    timeout: 5000
                });
                await createAlertBtn.click({
                    delay: 50
                });
                console.log("alert created")
                break; // Exit loop if successful
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error(`Failed after ${maxRetries} to create an alert for indicator: ${indicator} attempts: ${err.message}`);
                } else {
                    console.log(`Retrying (${attempt}/${maxRetries}) for ${indicator}...`);
                }
            }
        }
    }
    async function createUpAlert(charts, index, page, indicator) {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const indcatorLegend = charts.at(index);
                await indcatorLegend?.click();
                await delay(150)
                await page.keyboard.down('Alt')
                await page.keyboard.down('A')

                await page.keyboard.up('Alt')
                await page.keyboard.up('A')
                await delay(1000)
                await page.waitForSelector('[data-name="operator-select"]', {
                    timeout: 5000
                })
                await page.click('[data-name="operator-select"]', {
                    delay: 50
                })
                await page.waitForSelector('[data-name="popup-menu-container"] > div > div > div', {
                    timeout: 5000
                })
                const options = await page.$$('[data-name="popup-menu-container"] > div > div > div', {
                    timeout: 50
                })
                await options[19].click({
                    delay: 50
                })
                await page.waitForSelector('[data-name="once-per-bar-close"]', {
                    timeout: 5000
                })
                await page.click('[data-name="once-per-bar-close"]', {
                    delay: 50
                })
                const alertName = await page.waitForSelector('#alert-name', {
                    timeout: 5000
                })
                await alertName.type('luxalgo_trend-up', { // SF: Alert name
                    delay: 50
                })
                const textArea = await page.waitForSelector('#alert-message', {
                    timeout: 5000
                })
                await textArea.click({
                    delay: 50
                })
                await page.keyboard.down('Control')
                await page.keyboard.press('KeyA')
                await page.keyboard.up('Control')
                // await textArea.type(String.fromCharCode(8))
                await delay(300)
                await textArea.type('ticker={{ticker}}\ntime={{time}}\nalert={{alert-up}}', { // SF: JSON format of alert messages
                    
                    delay: 50
                })

                //await textArea.type(`ticker=${ticker}\ntime=${time}\nalert=${alertUp}`, {
                //     delay: 20
                //})

                const createAlertBtn = await page.waitForSelector('button[data-name="submit"]', {
                    timeout: 5000
                });
                await createAlertBtn.click({
                    delay: 50
                });
                console.log("alert created")
                break; // Exit loop if successful
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error(`Failed after ${maxRetries} to create an alert for indicator: ${indicator} attempts: ${err.message}`);
                } else {
                    console.log(`Retrying (${attempt}/${maxRetries}) for ${indicator}...`);
                }
            }
        }
    }
    async function createDownAlert(charts, index, page, indicator) {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const indcatorLegend = charts.at(index);
                await indcatorLegend?.click();
                await delay(150)
                await page.keyboard.down('Alt')
                await page.keyboard.down('A')

                await page.keyboard.up('Alt')
                await page.keyboard.up('A')
                await delay(1000)
                await page.waitForSelector('[data-name="operator-select"]', {
                    timeout: 5000
                })
                await page.click('[data-name="operator-select"]', {
                    delay: 50
                })
                await page.waitForSelector('[data-name="popup-menu-container"] > div > div > div', {
                    timeout: 5000
                })
                const options = await page.$$('[data-name="popup-menu-container"] > div > div > div', {
                    timeout: 50
                })
                await options[19].click({
                    delay: 50
                })
                await page.waitForSelector('[data-name="once-per-bar-close"]', {
                    timeout: 5000
                })
                await page.click('[data-name="once-per-bar-close"]', {
                    delay: 50
                })
                const alertName = await page.waitForSelector('#alert-name', {
                    timeout: 5000
                })
                await alertName.type('luxalgo_trend-down', { // SF: Alert name
                    delay: 50
                })
                const textArea = await page.waitForSelector('#alert-message', {
                    timeout: 5000
                })
                await textArea.click({
                    delay: 50
                })
                await page.keyboard.down('Control')
                await page.keyboard.press('KeyA')
                await page.keyboard.up('Control')
                // await textArea.type(String.fromCharCode(8))
                await delay(300)
                await textArea.type('ticker={{ticker}}\ntime={{time}}\nalert={{alert-down}}', { // SF: alert json message
                    delay: 50
                })
                const createAlertBtn = await page.waitForSelector('button[data-name="submit"]', {
                    timeout: 5000
                });
                await createAlertBtn.click({
                    delay: 50
                });
                console.log("alert created")
                break; // Exit loop if successful
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error(`Failed after ${maxRetries} to create an alert for indicator: ${indicator} attempts: ${err.message}`);
                } else {
                    console.log(`Retrying (${attempt}/${maxRetries}) for ${indicator}...`);
                }
            }
        }
    }
    // More Action Button
    async function addingAlerts(page) {
        await page.waitForSelector("[data-name='legend-source-title']");
        const charts = await page.$$("[data-name='legend-source-title']")
        await delay(1000)
        for (let i in charts) {
            if (i == 0) continue
            if (i == 1) {
                const text = await charts[i].evaluate(t => t.innerText)
                console.log("trying to add alert " + text)
                await createAlert(charts, i, page, text)
                await delay(2000)
                console.log("trying to add down alert " + text)
                await createDownAlert(charts, i, page, text)
                await delay(500)
            }
            if (i == 2) {
                const text = await charts[i].evaluate(t => t.innerText)
                console.log("trying to add up alert " + text)
                await createUpAlert(charts, i, page, text)
                await delay(500)
            }
            if (i == 3) {
                const text = await charts[i].evaluate(t => t.innerText)
                console.log("trying to add alert " + text)
                await createAlert(charts, i, page, text)
                await delay(500)
            }
        }
    }


    async function zoomOut(page) {
        for (let i = 0; i < 50; i++) {
            await page.keyboard.down('Control')
            await page.keyboard.down('ArrowDown')
            await page.keyboard.up('ArrowDown', {
                delay: 200
            })
            await page.keyboard.up('Control')
        }
    }
    async function setTheIntervalTo1Minute(page) {
        await page.waitForSelector('#header-toolbar-intervals button', {
            timeout: 5000
        })
        await page.click('#header-toolbar-intervals button', {
            delay: 50
        })
        await page.waitForSelector('[data-name="menu-inner"] > div [data-role="menuitem"]', {
            timeout: 5000
        })
        const intervals = await page.$$('[data-name="menu-inner"] > div [data-role="menuitem"]')
        const oneMinute = intervals.at(13)
        await oneMinute.click({
            delay: 50
        })
    }
    async function setTheIntervalTo1Day(page) {
        await page.waitForSelector('#header-toolbar-intervals button', {
            timeout: 5000
        })
        await page.click('#header-toolbar-intervals button', {
            delay: 50
        })
        await page.waitForSelector('[data-name="menu-inner"] > div [data-role="menuitem"]', {
            timeout: 5000
        })
        const intervals = await page.$$('[data-name="menu-inner"] > div [data-role="menuitem"]')
        const oneMinute = intervals.at(27)
        await oneMinute.click({
            delay: 50
        })
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
            await page.waitForSelector("#time-format-select", {
                timeout: 1000
            })
            await page.click("#time-format-select", {
                delay: 20
            })
            // await delay(1000) // SF: to remvoe the delay
            await page.waitForSelector("#time-format-iso", {
                timeout: 1000
            })
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
            // console.log("failed to save CSV, trying again...")
            // console.log(e)
            throw (e)
            // await downloadCSV(page)
        }
    }

    console.log(chalk.cyan("[SCRIPT MODE]: " + mode))
    if (mode == 0) {
        await changeTicker(ticker, page)
        await delay(1000)
        await addingAlerts(page)
        await delay(1000)
        const client = await page.createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.resolve(path.join(__dirname, '../csv_1minute')),
        });
        await delay(1000)
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.resolve(path.join(__dirname, '../csv_1minute')),
        });
        await zoomOut(page)
        await setTheIntervalTo1Minute(page)
        await delay(1000)
        await setTheIntervalTo1Minute(page)
        await delay(1000)
        await downloadCSV(page)
        await delay(1000)
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.resolve(path.join(__dirname, '../csv_1day')),
        });
        await delay(1000)
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.resolve(path.join(__dirname, '../csv_1day')),
        });
        await setTheIntervalTo1Day(page)
        await delay(1000)
        await setTheIntervalTo1Day(page)
        await delay(1000)
        await downloadCSV(page)
        await delay(5000)
        // let tries = 5
        // while (tries--) {
        //     if (findFilesByTicker(ticker, './csv').length) break
        // }
        console.log("CSV file downloaded")
    } else if (mode == 1 || mode == 2) {
        await changeTicker(ticker, page)
        // await zoomOut(page)
        await downloadCSV(page)
        // console.log("Downloading the csv file...")
        // let tries = 0
        // while (1) {
        //     if (findFilesByTicker(ticker, './csv').length) break
        //     if(tries == 5) throw new Error("not downloaded");
        //     await delay(300)
        //     tries++
        // }
        console.log("CSV file downloaded")
        await delay(1000)
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