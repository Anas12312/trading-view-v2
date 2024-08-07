const { processCSV, get, getAllTickers, updateItem } = require("./csv")
const runIndcator = require("./pup-script")
const fs = require('fs')
const path = require('path')
const { findFilesByTicker, getMostRecentFile } = require("./utils/extractTickerName")
const init = require("./puppeteer/launch")
const getCookies = require("./puppeteer/getCookies")
const addAllIndicators = require("./puppeteer/addIndicators")
const spreadTasks = require("./utils/spreadTasks")
const os = require('os')
const chalk = require("chalk")
async function main() {

    // 0- Add all missing indicators
    // await addAllIndicators(false)
    // 1- Get all tickers along with mode from dynamoDB
    const tickers = await getAllTickers()
    const cpuCount = os.cpus().length;
    console.log(cpuCount)
    // const noOfBrowsers = Math.floor(cpuCount * 0.6)
    const noOfBrowsers =50
    const noOfTickersPerChunks = 15
    // const tickers = [
    //     {
    //         ticker: 'AAPL',
    //         status: 0
    //     }
    // ]
    // const queues = spreadTasks(tickers, tickers.length / noOfTickersPerChunks)
    const queues = spreadTasks(tickers, noOfBrowsers)
    console.log(queues)
    console.log(chalk.green("[NUMBER OF TICKERS]: ") + chalk.blue(tickers.length) + "\tUSING " + chalk.yellow(noOfBrowsers) + " CORES")
    console.log(chalk.green("[TICKERS PER CORE]: ") + chalk.yellow(Math.ceil(tickers.length / queues.length)))
    // console.log(queues)
    // getCookies()
    // 2- Run indicator creation script (TickerName, Mode)
    // 3- Parse CSV -> Store outcome in dynamoDB
    const cluster = await init(noOfBrowsers)
    const startTime = new Date()

    queues.forEach((queue) => {
        cluster.queue({
            tickers: queue,
            startTime
        })
    })

    // setTimeout(() => {
    //     const startTime = new Date()
    //     queues.forEach((queue) => {
    //         cluster.queue({
    //             tickers: queue,
    //             startTime
    //         })
    //     })
    // }, 1 * 60 * 1000)

    await cluster.idle();
    await cluster.close();
    console.log("TOTAL TIME: ")
    const after = new Date()
    console.log((after - startTime) / 1000)
}
main()