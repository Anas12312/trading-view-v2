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
    const startTime = new Date()

    // 0- Add all missing indicators
    // await addAllIndicators(false)
    // 1- Get all tickers along with mode from dynamoDB
    const tickers = await getAllTickers()
    const cpuCount = os.cpus().length;
    console.log(cpuCount)
    const noOfBrowsers = Math.floor(cpuCount * 0.6)
    const noOfTickersPerChunks = 4
    // const tickers = [
    //     {
    //         ticker: "AAPL",
    //         status: 0
    //     },
    // //     {
    // //         ticker: "TSLA",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "NVDA",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "F",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "DAX",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "BX1",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "IB1",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "AMZN",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "WEED",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "MSFT",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "2330",
    // //         status: 0
    // //     },
    // //     {
    // //         ticker: "INTC",
    // //         status: 0
    // //     },
    // ]
    const queues = spreadTasks(tickers, tickers.length / noOfTickersPerChunks)
    // console.log(queues)
    console.log(chalk.green("[NUMBER OF TICKERS]: ") + chalk.blue(tickers.length) + "\tUSING " + chalk.yellow(noOfBrowsers) + " CORES")
    console.log(chalk.green("[TICKERS PER CORE]: ") + chalk.yellow(Math.ceil(tickers.length / queues.length)))
    // console.log(queues)
    // getCookies()
    // 2- Run indicator creation script (TickerName, Mode)
    // 3- Parse CSV -> Store outcome in dynamoDB
    const cluster = await init(noOfBrowsers)
    queues.forEach((queue) => {
        cluster.queue({
            queue,
            startTime
        })

        
    })

    // await cluster.idle();
    // await cluster.close();
}
main()