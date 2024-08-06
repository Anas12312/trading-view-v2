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
    // const tickers = await getAllTickers()
    const cpuCount = os.cpus().length;
    const noOfBrowsers = 2
    const tickers = [
        {
            ticker: "AAPL",
            status: 1
        },
        {
            ticker: "TSLA",
            status: 1
        },
        {
            ticker: "NVDA",
            status: 1
        },
        {
            ticker: "F",
            status: 1
        },
        {
            ticker: "DAX",
            status: 1
        },
        {
            ticker: "BX1",
            status: 1
        },
        {
            ticker: "IB1",
            status: 1
        },
        {
            ticker: "AMZN",
            status: 1
        },
        {
            ticker: "WEED",
            status: 1
        },
        {
            ticker: "MSFT",
            status: 1
        },
        {
            ticker: "2330",
            status: 1
        },
        {
            ticker: "INTC",
            status: 1
        },
        {
            ticker: "AAPL",
            status: 1
        },
        {
            ticker: "TSLA",
            status: 1
        },
        {
            ticker: "NVDA",
            status: 1
        },
        {
            ticker: "F",
            status: 1
        },
        {
            ticker: "DAX",
            status: 1
        },
        {
            ticker: "BX1",
            status: 1
        },
        {
            ticker: "IB1",
            status: 1
        },
        {
            ticker: "AMZN",
            status: 1
        },
        {
            ticker: "WEED",
            status: 1
        },
        {
            ticker: "MSFT",
            status: 1
        },
        {
            ticker: "2330",
            status: 1
        },
        {
            ticker: "INTC",
            status: 1
        },
        {
            ticker: "AAPL",
            status: 1
        },
        {
            ticker: "TSLA",
            status: 1
        },
        {
            ticker: "NVDA",
            status: 1
        },
        {
            ticker: "F",
            status: 1
        },
        {
            ticker: "DAX",
            status: 1
        },
        {
            ticker: "BX1",
            status: 1
        },
        {
            ticker: "IB1",
            status: 1
        },
        {
            ticker: "AMZN",
            status: 1
        },
        {
            ticker: "WEED",
            status: 1
        },
        {
            ticker: "MSFT",
            status: 1
        },
        {
            ticker: "2330",
            status: 1
        },
        {
            ticker: "INTC",
            status: 1
        },
    ]
    const queues = spreadTasks(tickers, noOfBrowsers)
    console.log(queues)
    console.log(chalk.green("[NUMBER OF TICKERS]: ") + chalk.blue(tickers.length) + "\tUSING " + chalk.yellow(queues.length) + " CORES")
    console.log(chalk.green("[TICKERS PER CORE]: ") + chalk.yellow(Math.ceil(tickers.length / queues.length)))
    // console.log(queues)
    // getCookies()
    // 2- Run indicator creation script (TickerName, Mode)
    // 3- Parse CSV -> Store outcome in dynamoDB
    const cluster = await init(noOfBrowsers)
    queues.forEach((queue) => {
        cluster.queue(queue)

        
    })

    // await cluster.idle();
    // await cluster.close();
}
main()