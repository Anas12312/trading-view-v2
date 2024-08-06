const { default: puppeteer } = require("puppeteer");
const fs = require('fs')
const config = require("../config");
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function addAllIndicators(headless) {
    const browser = await puppeteer.launch({
        timeout: 50_000,
        headless, // SF to enable headless feature of the browser
        defaultViewport: false
    })
    const page = await browser.newPage()
    await page.setCookie(...JSON.parse(fs.readFileSync('cookies.json')));
    await page.goto("https://www.tradingview.com/chart/", {
        waitUntil: "domcontentloaded"
    })
    const indicators = config.indicators
    for (let indicator of indicators) {
        await addIndicatorIfNotExist(indicator.short, indicator.name, page)
    }
    await save(page)
    await delay(500)
    await browser.close()
}
async function save(page) {
    try {
        await delay(200)
        await page.keyboard.down('Control')
        await page.keyboard.press("KeyS")
        await page.keyboard.up('Control')
    } catch (e) {
        await delay(200)
        console.log("failed to save, trying again...")
        console.log(e)
        await save(page)
    }
}
async function addIndicatorIfNotExist(indicatorShort, indicatorName, page) {
    try {
        console.log("checking if " + indicatorName + " exists")
        await page.waitForSelector("[data-name='legend-source-title']", {
            visible: true
        })
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
        if (!exists) await addIndicator(indicatorShort, indicatorName, page)
    } catch (e) {
        console.log("failed to check which indicators exist, trying again...")
        await addIndicatorIfNotExist(indicatorShort, indicatorName, page)
    }
}
async function addIndicator(indicatorSearch, indicatorName, page) {
    try {
        console.log("Adding indicator " + indicatorSearch)
        const indcatorsBtn = await page.waitForSelector('#header-toolbar-indicators button');
        await indcatorsBtn.click({
            delay: 100
        });
        await page.waitForSelector('[data-name="indicators-dialog"] input');
        await page.type('[data-name="indicators-dialog"] input', indicatorSearch, {
            delay: 50
        })
        const template = `[data-title="${indicatorName}"]`
        await page.waitForSelector(template)
        await delay(500)
        await page.click(template, {
            delay: 100,
        }) // SF: insepactor value "title" of the indicator
        console.log("clicked on the indicator")
        try {
            const exitBtn = await page.waitForSelector('[data-name="indicators-dialog"] button');

            await exitBtn.click({
                delay: 50
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
        await addIndicator(indicatorSearch, indicatorName, page)
    }
}

module.exports = addAllIndicators