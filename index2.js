const puppeteer = require('puppeteer')
const dotenv = require('dotenv');
const { timeout } = require('puppeteer');
dotenv.config();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function run(stockName) {
    const browser = await puppeteer.launch({
        timeout: 50_000,
        headless: false,
        userDataDir: process.env.CHROME_PATH,
        args: [
            "--profile-directory=Profile 3"
        ],
        defaultViewport: {
            height: 1400,
            width: 3000
        }
    })

    const page = await browser.newPage()
    page.setViewport({
        height: 900,
        width: 1400
    })

    // await page.goto("https://www.tradingview.com/pricing/?source=header_go_pro_button&feature=start_free_trial")
    // await page.waitForSelector('.tv-header__area.tv-header__area--user')

    // const header = await page.$('.tv-header__area.tv-header__area--user')

    // const accountBtn = (await header.$$('button')).at(1)
    // await accountBtn.click({
    //     delay: 100
    // })

    // await page.waitForSelector('.menuBox-Kq3ruQo8 button')

    // const menuElement = (await page.$$('.menuBox-Kq3ruQo8 button'))
    // const signInBtn = menuElement.at(1);
    // await signInBtn.click()
    // await page.waitForSelector('.container-R4aQJbLh')

    // const emailButton = (await page.$$('.container-R4aQJbLh button')).at(5);
    // await emailButton.click()
    // await page.waitForSelector('.form-LQwxK8Bm')

    // const emailInput = await page.$('.form-LQwxK8Bm #id_username');
    // await emailInput.type(process.env.EMAIL, {
    //     delay: 10
    // })

    // const passwordInput = await page.$('.form-LQwxK8Bm #id_password');
    // await passwordInput.type(process.env.PASSWORD, {
    //     delay: 10
    // })

    // const logInBtn = (await page.$$('.form-LQwxK8Bm button')).at(1);
    // await logInBtn.click({
    //     count: 1,
    //     delay: 10
    // })

    // await page.waitForNavigation({ timeout: 60_000 })


    await page.goto("https://www.tradingview.com/chart/")

    await page.waitForSelector('#header-toolbar-symbol-search')

    const searchBtn = await page.$('#header-toolbar-symbol-search')

    // await delay(1000)

    await searchBtn.click({
        delay: 10
    })
    await page.waitForSelector('.inputContainer-qm7Rg5MB input')

    const searchInput = await page.$('.inputContainer-qm7Rg5MB input')
    await searchInput.type(stockName, { delay: 10 });

    await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')

    await page.click('.itemRow-oRSs8UQo div:nth-child(1)')

    let addAlertBtn
    try {
        addAlertBtn = await page.waitForSelector('.leftSlot-u7Ufi_N7 .button-xNqEcuN2', { timeout: 1000 })
    }
    catch (e) {
        const toolBar = await page.waitForSelector('.toolbar-S4V6IoxY')
        const alertBtn = await toolBar.$('button:nth-child(2)')
        await alertBtn.click({
            delay: 10
        })
        addAlertBtn = await page.waitForSelector('.leftSlot-u7Ufi_N7 .button-xNqEcuN2')
    }

    await addAlertBtn.click({
        delay: 10
    })

    const alerNameInput = await page.waitForSelector('input#alert-name')
    await alerNameInput.type('Testing', {
        delay: 10
    })

    const createBtn = await page.$('button.submitBtn-RHTYtJvz')
    await createBtn.click({
        delay: 10
    })
}
// run('AAPL')

const runIndcator = async (stockName) => {
    const browser = await puppeteer.launch({
        timeout: 50_000,
        headless: false,
        userDataDir: process.env.CHROME_PATH,
        args: [
            "--profile-directory=Profile 1"
        ]
    })

    const page = await browser.newPage()
    await page.setViewport({
        height: 900,
        width: 1500
    })
    await page.goto("https://www.tradingview.com/chart/", {
        waitUntil: "domcontentloaded"
    })

    // Change Ticker Name

    await page.waitForSelector('#header-toolbar-symbol-search')

    const searchBtn = await page.$('#header-toolbar-symbol-search')

    
    await searchBtn.click({
        delay: 10
    })
    await page.waitForSelector('.inputContainer-qm7Rg5MB input')
    
    const searchInput = await page.$('.inputContainer-qm7Rg5MB input')
    await searchInput.type(stockName, { delay: 10 });
    
    await page.waitForSelector('.scrollContainer-dlewR1s1 .listContainer-dlewR1s1 .itemRow-oRSs8UQo')
    
    await page.click('.itemRow-oRSs8UQo div:nth-child(1)')
    
    // await delay(100_000)

    // Add Indcator
    async function selectIndicator() {
        console.log("trying to select indication")
        try {
            const indcatorsBtn = await page.waitForSelector('#header-toolbar-indicators button');

            await indcatorsBtn.click({
                delay: 100
            });
            await page.waitForSelector('.input-qm7Rg5MB');
            await delay(500)
            await page.type('.input-qm7Rg5MB', 'ADX')
            await delay(100)
            await page.waitForSelector('[data-title="Average Directional Index"]')
            await delay(1000)

            await page.click(`[data-title="Average Directional Index"]`, {
                delay: 100
            })
            console.log("clicked on the indicator")

        }
        catch (e) {
            console.log(e)
            await selectIndicator()
        }
    }
    await selectIndicator()
    await delay(1000)
    try {
        const exitBtn = await page.waitForSelector('[data-name="indicators-dialog"] button');

        await exitBtn.click({
            delay: 100
        });
        console.log("closed the dialog")
    } catch (e) {
        console.log("couldn't close the dialog")
    }
    // Save Changes
    await delay(1000)
    async function save() {
        try {
            await page.click('button#header-toolbar-save-load', {
                delay: 1000
            })
            console.log("saved")
        } catch (e) {
            console.log("failed to save, trying again...")
            await save()
        }
    }
    await save()
    // Select Indcator from Chart

    async function selectTheIndicatorLegend() {
        try {
            await page.waitForSelector("[data-name='legend-source-title']");
            await delay(500)
            const charts = await page.$$("[data-name='legend-source-title']")

            const indcatorLegend = charts.at(1);
            await indcatorLegend.click();
            console.log("selected the indicator legend")
        } catch (e) {
            console.log("failed to select the indicator legend")
            await selectTheIndicatorLegend()
        }
    }
    await delay(1000)
    await selectTheIndicatorLegend()

    await delay(1000);

    // Setting Button
    try {
        await page.waitForSelector('[data-name="legend-settings-action"]')
        const indcatorSettingButton = (await page.$$('[data-name="legend-settings-action"]')).at(0)
        await indcatorSettingButton.click();
        console.log("opened the settings")
    } catch (e) {
        console.log("failed to open the settings")
    }
 // await delay(1000); // SF: to remvoe the delay

    // Setting Button
    // try {
    //     await page.waitForSelector('[data-name="legend-settings-action"]')
    //     const indcatorSettingButton = (await page.$$('[data-name="legend-settings-action"]')).at(0)
    //     await indcatorSettingButton.click();
    //     console.log("opened the settings")
    // } catch (e) {
    //     console.log("failed to open the settings")
    // }

    // try {
    //     await page.waitForSelector('#in_4')
    //     await page.click('#in_4', {
    //         delay: 50
    //     })
    //     await page.waitForSelector('#id_in_4_item_None')
    //     await page.click('#id_in_4_item_None', {
    //         delay: 50
    //     })
    //     await page.waitForSelector('input[type="checkbox"]')
    //     const checkboxes = await page.$$('input[type="checkbox"]')
    //     const smartTrail = checkboxes.at(1)
    //     await smartTrail.click({
    //         delay: 50
    //     })
    //     await delay(500)
    //     const trendChatcher = checkboxes.at(3)
    //     await trendChatcher.click({
    //         delay: 50
    //     })
    //     await delay(500)
    //     const trendTracer = checkboxes.at(4)
    //     await trendTracer.click({
    //         delay: 50
    //     })
    //     await page.waitForSelector('#in_24')
    //     await page.click('#in_24', {
    //         delay: 50
    //     })
    //     await page.waitForSelector('#id_in_24_item_Long-Term')
    //     await page.click('#id_in_24_item_Long-Term', {
    //         delay: 50
    //     })
    //     const BullConf = checkboxes.at(23)
    //     await BullConf.click({
    //         delay: 50
    //     })
    //     const BearConf = checkboxes.at(25)
    //     await BearConf.click({
    //         delay: 50
    //     })
    //     const Bullplus = checkboxes.at(24)
    //     await Bullplus.click({
    //         delay: 50
    //     })
    //     const Bearplus = checkboxes.at(26)
    //     await Bearplus.click({
    //         delay: 50
    //     })
    //     const BullExit = checkboxes.at(31)
    //     await BullExit.click({
    //         delay: 50
    //     })
    //     const BearExit = checkboxes.at(32)
    //     await BearExit.click({
    //         delay: 50
    //     })
    //     console.log("changed settings")
    // } catch (e) {
    //     console.log("failed to change the settings")
    // }

    // try {
    //     // await delay(1000) // SF: to remvoe the delay
    //     const okBtn = await page.waitForSelector('button[name="submit"]')
    //     await okBtn.click();
    //     console.log("clicked submit settings")
    // } catch (e) {
    //     console.log("failed to click submit settings")
    // }
    try {
        await delay(1000)
        await page.waitForSelector('[data-name="indicator-properties-dialog"] input')
        const smoothingInput = (await page.$$('[data-name="indicator-properties-dialog"] input')).at(0)

        await smoothingInput.type('25', {
            delay: 100
        });

        // await delay(1000);

        const DI_Length = (await page.$$('[data-name="indicator-properties-dialog"] input')).at(1)

        await DI_Length.type('13', {
            delay: 100
        });
        console.log("changed settings")
    } catch (e) {
        console.log("failed to change the settings")
    }

    // await delay(1000);
    try {
        await delay(1000)
        const okBtn = await page.waitForSelector('button[name="submit"]')
        await okBtn.click();
        console.log("clicked submit settings")
    } catch (e) {
        console.log("failed to click submit settings")
    }

    await save()

    // More Action Button
    await page.waitForSelector("[data-name='legend-source-title']");
    await delay(500)
    const charts = await page.$$("[data-name='legend-source-title']")

    const indcatorLegend = charts.at(1);
    await indcatorLegend?.click();

    await page.keyboard.down('Alt')
    await page.keyboard.down('A')

    await page.keyboard.up('Alt')
    await page.keyboard.up('A')

    // Notification Tab
    try {
        await delay(1000)
        const notificationTabBtn = await page.waitForSelector('#alert-dialog-tabs__notifications');

        await notificationTabBtn.click({
            delay: 10
        })
        console.log("pressed on the notification tab")
    } catch (e) {
        console.log("failed to press on the notification tab")
    }

    // // const enableWebhook = await page.waitForSelector('div[data-name="alerts-create-edit-dialog"] .tabsWrapper-v6smTDmN div[data-name="underline-tabs-buttons"] div#id_alerts-create-edit-dialog-tabs_tablist button#alert-dialog-tabs__notifications');
    // // await notificationTabBtn.click({
    // //     delay: 10
    // // })

    // // await page.click('#alert-dialog-tabs__notifications',
    // //     { delay: 1000 }
    // // )

    // // await page.click('input[data-name="webhook"]',
    // //     { delay: 100 }
    // // );

    // // await page.type('input#webhook-url',
    // //     'http://18.220.204.73/webhook',
    // //     { delay: 50 }
    // // );

    try {
        await delay(1000)
        const createAlertBtn = await page.waitForSelector('button[data-name="submit"]');
        await delay(1000)
        await createAlertBtn.click({
            delay: 100
        });
        console.log("pressed create alert")
    } catch (e) {
        console.log("failed to press create alert")
    }

    // Save Changes
    await save()
    await delay(1000)
    async function zoomOut() {
        await page.keyboard.down('Control')
        await page.keyboard.down('ArrowDown')
        await page.keyboard.up('ArrowDown')
        await delay(500)
        await page.keyboard.down('ArrowDown')
        await page.keyboard.up('ArrowDown')
        await delay(500)
        await page.keyboard.down('ArrowDown')
        await page.keyboard.up('ArrowDown')
    }
    await zoomOut()
    async function downloadCSV() {
        try {
            await page.waitForSelector('[data-name="save-load-menu"]')
            const dropDownBtn = await page.$('[data-name="save-load-menu"]')
            await dropDownBtn.click({
                delay: 20
            })
            await delay(1000)
            console.log("clicked on the dropdown button")
            await page.waitForSelector('[data-name="menu-inner"] [data-role="menuitem"]')
            const menuBtn = (await page.$$('[data-name="menu-inner"] [data-role="menuitem"]')).at(5)
            menuBtn.click({
                delay: 100
            })
            await delay(1000)
            console.log("clicked on the menu button")
            await page.waitForSelector("#time-format-select")
            const dropDownButton = (await page.$("#time-format-select"))
            await dropDownButton.click({
                delay: 20
            })
            await delay(1000)
            await page.waitForSelector("#time-format-iso")
            await page.click("#time-format-iso", {
                delay: 20
            })
            await delay(1000)
            console.log("changed time format")
            await page.click("[data-name='submit-button']", {
                delay: 20
            })
            console.log("submitted the downloadCSV dialog")
        } catch (e) {
            console.log("failed to save CSV, trying again...")
            await downloadCSV()
        }
    }
    await downloadCSV()


}

runIndcator("AAPL")