import puppeteer from 'puppeteer'

const INPUT = {
    ticketId: 'DWYVTZ3',
    phoneNr: '0700464856',
    email: '99nesk@gmail.com',
    personalNumber: '19990102-9174',
    date: '2025-08-20',
    time: '07:35',
    delayDuration: '40-59 min',
    destinationFrom: 'Malmö C',
    destinationTo: 'Østerport St.',
}

const URL = 'https://www.skanetrafiken.se/kundservice/forseningsersattning/ansokan/'

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // '--disable-features=site-per-process',
    ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1024, height: 1800 })

try {
    // Step 1 --------------------------------------------------------------------
    console.log('Step 1...')
    await page.goto(URL)
    await sleep(1000)
    await page.screenshot({ path: 'screenshots/0.png' })

    await page.waitForSelector('button#CybotCookiebotDialogBodyButtonDecline', { visible: true })
    await page.click('button#CybotCookiebotDialogBodyButtonDecline')
    await page.screenshot({ path: 'screenshots/1.png' })

    await page.select('select#TravelDateStep1', INPUT.date)
    await page.screenshot({ path: 'screenshots/2.png' })

    await page.$eval('input#IsAppTicket', (el) => el.click())
    await page.screenshot({ path: 'screenshots/3.png' })

    await page.waitForSelector('#AppPhoneNr', { visible: true })
    await page.type('input#AppPhoneNr', INPUT.phoneNr)
    await page.type('input#AppTicketNr', INPUT.ticketId)
    await page.screenshot({ path: 'screenshots/4.png' })

    await page.click('button.continue')
    await page.waitForNavigation()
    await page.screenshot({ path: 'screenshots/5.png' })

    // Step 2 --------------------------------------------------------------------
    console.log('Step 2...')
    await sleep(1000)
    await page.waitForSelector('select#Deleyed', { visible: true })
    await page.select('select#Deleyed', INPUT.delayDuration)
    await page.screenshot({ path: 'screenshots/6.png' })

    await page.waitForSelector('input#fromDestinationAutocompleteCombobox', { visible: true })
    await page.type('input#fromDestinationAutocompleteCombobox', INPUT.destinationFrom)
    await page.waitForSelector('li#fromDestinationOption-0', { visible: true })
    await page.click('li#fromDestinationOption-0')
    await page.type('input#toDestinationAutocompleteCombobox', INPUT.destinationTo)
    await page.waitForSelector('li#toDestinationOption-0', { visible: true })
    await page.click('li#toDestinationOption-0')
    await page.screenshot({ path: 'screenshots/7.png' })

    await page.select('select#hoursSelect', INPUT.time.split(':')[0])
    await page.select('select#minutesSelect', INPUT.time.split(':')[1])
    await page.screenshot({ path: 'screenshots/8.png' })

    await page.click('.st-search-form__search__submit > button')
    await page.screenshot({ path: 'screenshots/9.png' })

    await page.waitForSelector('div.st-search-rgol-result__route', { visible: true })
    await page.click('div.st-search-rgol-result__route')
    await page.screenshot({ path: 'screenshots/10.png' })

    await page.waitForSelector('div.st-selected-rgol-journeys', { visible: true })
    await page.screenshot({ path: 'screenshots/11.png' })

    await page.click('button.continue')
    await page.waitForNavigation()
    await page.screenshot({ path: 'screenshots/12.png' })

    // Step 3 --------------------------------------------------------------------
    console.log('Step 3...')
    await sleep(1000)
    await page.waitForSelector('input#ISSTJourney', { visible: true })
    await page.$eval('input#ISSTJourney', (el) => el.click())
    await page.screenshot({ path: 'screenshots/13.png' })

    await page.click('button.continue')
    await page.waitForNavigation()
    await page.screenshot({ path: 'screenshots/14.png' })

    // Step 4 --------------------------------------------------------------------
    console.log('Step 4...')
    await sleep(1000)
    await page.waitForSelector('input#Email', { visible: true })
    await page.type('input#Email', INPUT.email)
    await page.type('input#SocialSecurityNumber', INPUT.personalNumber)
    await page.screenshot({ path: 'screenshots/15.png' })

    await sleep(3000)
    await page.screenshot({ path: 'screenshots/16.png' })

    await page.click('button.continue')
    await page.waitForNavigation()
    await page.screenshot({ path: 'screenshots/17.png' })

    // Step 5 --------------------------------------------------------------------
    console.log('Step 5...')
    await sleep(1000)
    await page.waitForSelector('input#IsVoucher1', { visible: true })
    await page.$eval('input#IsVoucher1', (el) => el.click())
    await page.waitForSelector('div#divVoucher1', { visible: true })
    await page.screenshot({ path: 'screenshots/18.png' })

    await page.waitForSelector('input#Voucher1SelectSMS', { visible: true })
    await page.$eval('input#Voucher1SelectSMS', (el) => el.click())
    await page.screenshot({ path: 'screenshots/19.png' })

    await sleep(1000)

    await page.click('button.continue')
    await page.waitForNavigation()
    await page.screenshot({ path: 'screenshots/20.png' })

    // Step 6 --------------------------------------------------------------------
    console.log('Step 6...')
    await sleep(2000)
    await page.$$eval('input[type="checkbox"]', (els) => els.forEach((el) => el.click()))
    await page.screenshot({ path: 'screenshots/21.png' })

    // TODO: Uncomment to actually submit the form
    // await page.click('button.continue')
    // await page.waitForNavigation()
    // await page.screenshot({ path: 'screenshots/21.png' })

    await browser.close()
} catch (error) {
    console.error(error)
    await browser.close()
    process.exit(1)
}
