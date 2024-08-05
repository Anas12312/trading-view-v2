const { processCSV, get, getAllTickers, updateItem } = require("./csv")
const runIndcator = require("./pup-script")
const fs = require('fs')
const path = require('path')
const { findFilesByTicker, getMostRecentFile } = require("./utils/extractTickerName")
const init = require("./puppeteer/launch")
const getCookies = require("./puppeteer/getCookies")
const addAllIndicators = require("./puppeteer/addIndicators")
async function main() {
    // 0- Add all missing indicators
    await addAllIndicators(false)
    // 1- Get all tickers along with mode from dynamoDB
    // const tickers = await getAllTickers()
    const tickers = [
        {
            ticker: "AAPL",
            status: 2
        },
        // {
        //     ticker: "TSLA",
        //     status: 1
        // },
        // {
        //     ticker: "NVDA",
        //     status: 1
        // },
    ]
    console.log(tickers)
    // getCookies()
    // 2- Run indicator creation script (TickerName, Mode)
    // 3- Parse CSV -> Store outcome in dynamoDB
    // const cluster = await init(false, tickers.length)
    // tickers.forEach((ticker) => {
    //     cluster.queue(ticker)
        
    //     // const filePaths = findFilesByTicker(ticker.ticker, './csv')
    //     // const mostRecentFile = getMostRecentFile(filePaths, './csv')
    //     // mostRecentFile && await processCSV(path.join(__dirname, 'csv', mostRecentFile), ticker)
    //     // ticker.status == 0 && await updateItem(ticker.ticker, 2)
    // })

    // await cluster.idle();
    // await cluster.close();
}
main()