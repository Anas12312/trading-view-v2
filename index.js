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
    console.log(cpuCount)
    // const noOfBrowsers = Math.floor(cpuCount * 0.6)
    const noOfBrowsers = 4
    const noOfTickersPerChunks = 4
    const tickers = [
        {
            "ticker": "HBB",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": "2024-08-06T12:08:00-04:00",
            "bullish_plus_bartime": "2024-08-05T09:43:00-04:00",
            "status": 5
        },
        {
            "ticker": "KRNL",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "IXHL",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 5
        },
        {
            "ticker": "HUBC",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 5
        },
        {
            "ticker": "CRVO",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "NAOV",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "IMNN",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "BTCY",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "NMTC",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": "2024-08-01T16:04:00-04:00",
            "bullish_bartime": "2024-08-06T09:30:00-04:00",
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "VRAX",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": "2024-08-02T10:09:00-04:00",
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": "2024-08-05T12:27:00-04:00",
            "status": 0
        },
        {
            "ticker": "CSTL",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "XGN",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "HAO",
            "bearish_bartime": "2024-08-05T15:51:00-04:00",
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": "2024-08-05T12:32:00-04:00",
            "bullish_plus_bartime": "2024-08-06T07:00:00-04:00",
            "status": 0
        },
        {
            "ticker": "BBGI",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "KVHI",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "LUCD",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "MGOL",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "MDJH",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "LSEA",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 0
        },
        {
            "ticker": "MIRA",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "CAPT",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "BIAF",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "NVCT",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": "2024-08-05T09:30:00-04:00",
            "bullish_bartime": "2024-08-02T19:11:00-04:00",
            "bullish_exit_bartime": "2024-08-06T10:02:00-04:00",
            "bullish_plus_bartime": "2024-08-05T11:20:00-04:00",
            "status": 5
        },
        {
            "ticker": "OKYO",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 5
        },
        {
            "ticker": "TENK",
            "bearish_bartime": "2024-08-05T17:30:00-04:00",
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": "2024-08-05T13:01:00-04:00",
            "bullish_exit_bartime": "2024-08-05T15:09:00-04:00",
            "bullish_plus_bartime": null,
            "status": 0
        },
        {
            "ticker": "PITA",
            "bearish_bartime": "2024-08-06T06:22:00-04:00",
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": "2024-08-05T17:32:00-04:00",
            "bullish_plus_bartime": "2024-08-05T11:32:00-04:00",
            "status": 0
        },
        {
            "ticker": "PW",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "KYTX",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "LYT",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 0
        },
        {
            "ticker": "KTTA",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "INDO",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "PRZO",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": null,
            "bullish_bartime": null,
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": null,
            "status": 5
        },
        {
            "ticker": "HUSA",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "HPCO",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "WATT",
            "bearish_bartime": null,
            "bearish_exit_bartime": null,
            "bearish_plus_bartime": "2024-08-02T12:02:00-04:00",
            "bullish_bartime": "2024-08-05T10:10:00-04:00",
            "bullish_exit_bartime": null,
            "bullish_plus_bartime": "2024-08-01T19:02:00-04:00",
            "status": 5
        },
        {
            "ticker": "EVER",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "ASPS",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "FORD",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "SKYE",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 5
        },
        {
            "ticker": "MARPS",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "LTBR",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "ISPR",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        },
        {
            "ticker": "SNTI",
            "bearish_bartime": "2024-01-01 04:00:00",
            "bearish_exit_bartime": "2024-01-01 04:00:00",
            "bearish_plus_bartime": "2024-01-01 04:00:00",
            "bullish_bartime": "2024-01-01 04:00:00",
            "bullish_exit_bartime": "2024-01-01 04:00:00",
            "bullish_plus_bartime": "2024-01-01 04:00:00",
            "status": 0
        }
    ]
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

    setTimeout(() => {
        const startTime = new Date()
        queues.forEach((queue) => {
            cluster.queue({
                tickers: queue,
                startTime
            })
        })
    }, 1 * 60 * 1000)

    // await cluster.idle();
    // await cluster.close();
}
main()