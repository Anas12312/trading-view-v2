const { launch } = require('puppeteer')
const fs = require('fs')
const puppeteer = require('puppeteer')

const getCookies = async () => {
    const browser = await launch({
        timeout: 50_000,
        headless: false,
        userDataDir: process.env.CHROME_PATH,
        args: [
            "--profile-directory=Profile 1"
        ],
        defaultViewport: false
    })

    const page = await browser.newPage()
    await page.goto("https://www.tradingview.com/chart/", {
        waitUntil: "domcontentloaded"
    })
    fs.writeFileSync('cookies.json', JSON.stringify(await page.cookies()))
}

module.exports = getCookies