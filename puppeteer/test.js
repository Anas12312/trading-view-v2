const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');
const os = require('os');
const { default: puppeteer } = require('puppeteer');
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


async function test() {
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    try {
        await page.goto('https://www.google.com', {
            waitUntil: "load"
        })
        const btn = await page.waitForSelector('div', {
            timeout: 3000
        })
        await page.close()
        await btn.click()
    } catch(e) {
        console.log(e)
        console.log("failed")
    }
}
const texts = []

const before = new Date()
test()