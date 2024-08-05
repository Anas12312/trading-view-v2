const puppeteer = require('puppeteer')
const dotenv = require('dotenv');
const { timeout } = require('puppeteer');
const config = require('./config');
dotenv.config();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function run(stockName) {
    const browser = await puppeteer.launch({
        timeout: 50_000,
        headless: false,
        userDataDir: process.env.CHROME_PATH,
        args: [
            "--profile-directory=Profile 3"
        ],
        defaultViewport: {
            height: 1400,
            width: 3000
        }
    })

    const page = await browser.newPage()
    page.setViewport({
        height: 900,
        width: 1400
    })

    // await page.goto("https://www.tradingview.com/pricing/?source=header_go_pro_button&feature=start_free_trial")
    // await page.waitForSelector('.tv-header__area.tv-header__area--user')

    // const header = await page.$('.tv-header__area.tv-header__area--user')

    // const accountBtn = (await header.$$('button')).at(1)
    // await accountBtn.click({
    //     delay: 100
    // })

    // await page.waitForSelector('.menuBox-Kq3ruQo8 button')

    // const menuElement = (await page.$$('.menuBox-Kq3ruQo8 button'))
    // const signInBtn = menuElement.at(1);
    // await signInBtn.click()
    // await page.waitForSelector('.container-R4aQJbLh')

    // const emailButton = (await page.$$('.container-R4aQJbLh button')).at(5);
    // await emailButton.click()
    // await page.waitForSelector('.form-LQwxK8Bm')

    // const emailInput = await page.$('.form-LQwxK8Bm #id_username');
    // await emailInput.type(process.env.EMAIL, {
    //     delay: 10
    // })

    // const passwordInput = await page.$('.form-LQwxK8Bm #id_password');
    // await passwordInput.type(process.env.PASSWORD, {
    //     delay: 10
    // })

    // const logInBtn = (await page.$$('.form-LQwxK8Bm button')).at(1);
    // await logInBtn.click({
    //     count: 1,
    //     delay: 10
    // })

    // await page.waitForNavigation({ timeout: 60_000 })


    await page.goto("https://www.tradingview.com/chart/")

    await page.waitForSelector('#header-toolbar-symbol-search')

    const searchBtn = await page.$('#header-toolbar-symbol-search')

    // await delay(1000)

    await searchBtn.click({
        delay: 10
    })
    await page.waitForSelector('.inputContainer-qm7Rg5MB input')

    const searchInput = await page.$('.inputContainer-qm7Rg5MB input')
    await searchInput.type(stockName, { delay: 10 });

    await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')

    await page.click('.itemRow-oRSs8UQo div:nth-child(1)')

    let addAlertBtn
    try {
        addAlertBtn = await page.waitForSelector('.leftSlot-u7Ufi_N7 .button-xNqEcuN2', { timeout: 1000 })
    }
    catch (e) {
        const toolBar = await page.waitForSelector('.toolbar-S4V6IoxY')
        const alertBtn = await toolBar.$('button:nth-child(2)')
        await alertBtn.click({
            delay: 10
        })
        addAlertBtn = await page.waitForSelector('.leftSlot-u7Ufi_N7 .button-xNqEcuN2')
    }

    await addAlertBtn.click({
        delay: 10
    })

    const alerNameInput = await page.waitForSelector('input#alert-name')
    await alerNameInput.type('Testing', {
        delay: 10
    })

    const createBtn = await page.$('button.submitBtn-RHTYtJvz')
    await createBtn.click({
        delay: 10
    })
}
// run('AAPL')

const runIndcator = async (ticker, mode) => {
    async function init(headless) {
        try {
            console.log("Initializing Browser...")
            const browser = await puppeteer.launch({
                timeout: 50_000,
                headless, // SF to enable headless feature of the browser
                userDataDir: process.env.CHROME_PATH,
                args: [
                    "--profile-directory=Profile 1"
                ],
                defaultViewport: false
            })

            const page = await browser.newPage()
            // await page.setViewport({
            //     height: 900,
            //     width: 1500
            // })
            await page.goto("https://www.tradingview.com/chart/", {
                waitUntil: "domcontentloaded"
            })
            console.log("Browser Initialized")
            return { browser, page }
        } catch (e) {
            console.log("Failed to Initialize the browser, trying again...")
            await delay(2000)
            console.log(e)
            throw new Error("Failed to Initialize the browser, trying again...")
        }
    }
    // Change Ticker Name

    async function changeTicker(stockName, browser) {
        try {
            const page = await browser.newPage()
            // await page.setViewport({
            //     height: 900,
            //     width: 1500
            // })
            await page.goto("https://www.tradingview.com/chart/", {
                waitUntil: "domcontentloaded"
            })
            console.log("changing the ticker name")
            await page.waitForSelector('#header-toolbar-symbol-search')
            const searchBtn = await page.$('#header-toolbar-symbol-search')
            await searchBtn.click({
                delay: 10
            })
            await page.waitForSelector('[data-name="symbol-search-items-dialog"] input')

            const searchInput = await page.$('[data-name="symbol-search-items-dialog"] input')
            await delay(200)
            await searchInput.type(stockName, { delay: 100 });
            await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')
            await delay(500)
            await page.click('.itemRow-oRSs8UQo div:nth-child(1)')
            console.log("changed ticker name")
            return page
        } catch (e) {
            console.log("failed to change ticker name, trying again...")
            return await changeTicker(stockName)
        }
    }

    // Add Indcator
    async function addIndicator(indicatorSearch, indicatorName, browser, page) {
        try {
            console.log("Adding indicator " + indicatorSearch)
            const indcatorsBtn = await page.waitForSelector('#header-toolbar-indicators button');
            await delay(500)
            await indcatorsBtn.click({
                delay: 100
            });

            await page.waitForSelector('[data-name="indicators-dialog"] input');
            await delay(500)
            await page.type('[data-name="indicators-dialog"] input', indicatorSearch)
            await delay(100)
            const template = `[data-title="${indicatorName}"]`
            await page.waitForSelector(template)
            await delay(500)
            await page.click(template, {
                delay: 100
            }) // SF: insepactor value "title" of the indicator
            await delay(200)
            console.log("clicked on the indicator")
            try {
                const exitBtn = await page.waitForSelector('[data-name="indicators-dialog"] button');

                await exitBtn.click({
                    delay: 100
                });
                console.log("closed the dialog")
            } catch (e) {
                console.log("couldn't close the dialog")
                throw new Error()
            }
        }
        catch (e) {
            console.log(e)
            await delay(200)
            await addIndicator(indicatorSearch, indicatorName, browser, page)
        }
    }
    async function addIndicatorIfNotExist(indicatorShort, indicatorName, browser, page) {
        try {
            console.log("checking if " + indicatorName + " exists")
            await page.waitForSelector("[data-name='legend-source-title']")
            await delay(1000)
            const charts = await page.$$("[data-name='legend-source-title']")
            let exists = false
            for (let chart of charts) {
                const chartLegend = await chart.evaluate(c => c.textContent)
                // console.log(chartLegend)
                if (chartLegend == indicatorShort) {
                    console.log(indicatorShort + " already exists")
                    exists = true
                    break
                }
            }
            if (!exists) await addIndicator(indicatorShort, indicatorName, browser, page)
        } catch (e) {
            console.log("failed to check which indicators exist, trying again...")
            await addIndicatorIfNotExist(indicatorShort, indicatorName, browser, page)
        }
    }
    async function addAllIndicators(browser, page) {
        const indicators = config.indicators
        for (let indicator of indicators) {
            await addIndicatorIfNotExist(indicator.short, indicator.name, browser, page)
        }
    }
    // await delay(1000) // SF: to remvoe the delay

    // Save Changes
    // await delay(1000) // SF: to remvoe the delay
    async function save(browser, page) {
        try {
            await page.click('button#header-toolbar-save-load', {
                delay: 500,
                count: 2
            })
            console.log("saved")
        } catch (e) {
            await delay(200)
            console.log("failed to save, trying again...")
            await save(browser, page)
        }
    }


    // create alert
    async function createAlert(charts, index, browser, page) {
        try {
            await delay(200)
            const indcatorLegend = charts.at(index);
            await indcatorLegend?.click();
            await delay(200)
            await page.keyboard.down('Alt')
            await page.keyboard.down('A')

            await page.keyboard.up('Alt')
            await page.keyboard.up('A')
            const createAlertBtn = await page.waitForSelector('button[data-name="submit"]', {
                timeout: 1000
            });
            await createAlertBtn.click({
                delay: 100
            });
            console.log("alert created")
        } catch (e) {
            console.log(e)
            console.log("failed to create alert, trying again...")
            await delay(50)
            await createAlert(charts, index, browser, page)
        }
    }
    // More Action Button
    async function addingAlerts(browser, page) {
        await page.waitForSelector("[data-name='legend-source-title']");
        await delay(500)
        const charts = await page.$$("[data-name='legend-source-title']")
        for (let i in charts) {
            if (i == 0) continue
            await createAlert(charts, i, browser, page)
            await delay(500)
        }
    }


    async function zoomOut(browser, page) {
        await page.keyboard.down('Control')
        for (let i = 0; i < 50; i++) {
            await page.keyboard.down('ArrowDown')
            await page.keyboard.up('ArrowDown')
            await delay(500)
        }
        await page.keyboard.up('Control')
    }
    async function downloadCSV(browser, page) {
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
            await downloadCSV(browser, page)
        }
    }
    // await downloadCSV()
    // await delay(3000)
    // await browser.close()
    // async function handleTicker(ticker) {
    //     const newPage = await changeTicker(ticker, browser, page)
    //     await addingAlerts(browser, newPage)
    //     await save(browser, newPage)
    //     await zoomOut(browser, newPage)
    // }
    console.log("running the script" + "with mode: " + mode)
    if (mode == 0) {
        const { browser, page } = await init(false) // true for headless
        await addAllIndicators(browser, page)
        await save(browser, page)
        await delay(500)
        const newPage = await changeTicker(ticker, browser, page)
        await addingAlerts(browser, newPage)
        await save(browser, newPage)
        await zoomOut(browser, newPage)
        await downloadCSV(browser, newPage)
        await delay(2000)
        await browser.close()
    } else if (mode == 1) {
        const { browser, page } = await init(false) // true for headless
        await delay(500)
        const newPage = await changeTicker(ticker, browser, page)
        await zoomOut(browser, newPage)
        await downloadCSV(browser, newPage)
        await delay(2000)
        await browser.close()
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