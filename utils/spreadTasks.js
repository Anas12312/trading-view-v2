function spreadTasks(tickers, noBrowsers) {
    let queues = []
    const queueLength = Math.ceil(tickers.length / noBrowsers)
    for(let i = 0;i<noBrowsers;i++) {
        queues.push([])
    }
    for(let i = 0; i < noBrowsers; i++) {
        for(let j = i * queueLength; j < ((i+1) * queueLength); j++) {
            queues[i].push({
                ...tickers[j],
                core: i
            })
        }
    }
    return queues
}
module.exports = spreadTasks