const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');
const os = require('os');
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


async function test() {
    const cpuCount = os.cpus().length;
    console.log(cpuCount);
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: 6,
        puppeteerOptions: {
            timeout: 50_000,
            headless: true, // Enable headless mode
            defaultViewport: false
        },
        retryLimit: 0
    });

    let index = 0;
    await cluster.task(async ({ page, data }) => {
        let pagee = page
        for (let i in queries[data]) {
            try {
                console.log(data)
                await name(pagee, queries[data][i])
            } catch (e) {
                console.log(e)
                pagee = await (page.browser().newPage())
                continue
            }
        }
        pagee.close()
        // // Use a selector that is likely to be found after search results are loaded
        // await page.waitForSelector('.g', {
        //     timeout: 5000
        // });
    });
    async function name(page, data) {
        console.log(data)
        const b4 = new Date()
        // await page.waitForNavigation()
        await page.goto("https://www.google.com/");
        await page.waitForSelector('#APjFqb');
        await page.type('#APjFqb', data, { delay: 100 }); // Add a slight delay to mimic human typing

        // Make sure the button is in view and interactable
        const btns = await page.$$('.gNO89b');
        if (btns.length > 1) {
            await page.evaluate((btn) => {
                btn.scrollIntoView();
            }, btns[1]);
            await btns[1].click();
        }
        const h3 = await page.waitForSelector('h3')
        const text = await h3.evaluate(h => h.textContent)
        texts.push(text)
        const after = new Date()
        console.log(after - b4)
        // await delay(500)
    }
    const queries = [
        ["anas", "anazz", "zyad", "az"],
        ["anas", "anazz", "zyad", "az"],
        ["anas", "anazz", "zyad", "az"],
        ["anas", "anazz", "zyad", "az"],
        ["anas", "anazz", "zyad", "az"],
        ["anas", "anazz", "zyad", "az"],
    ];
    for (const query in queries) {
        cluster.queue(query);
    }

    await cluster.idle();
    await cluster.close();
}
const texts = []

const before = new Date()
test().then(data => {
    console.log('done')
    console.log(new Date() - before)
    console.log(texts.length)
    console.log(texts)
}).catch(err => {
    console.log(new Date() - before)
    console.log(texts.length)
    console.log(texts)
    console.error(err)
});