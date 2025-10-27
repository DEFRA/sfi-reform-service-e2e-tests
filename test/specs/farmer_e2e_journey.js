import { browser } from '@wdio/globals'
import HomePage from 'page-objects/home.page.js'
import LoginPage from 'page-objects/login.page.js'
import { SERVICE_NAME } from '~/test/utils/config.js'
import { runFundingApiJourney } from '~/test/utils/journey-api.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('SFI Application E2E Tests', () => {
  describe('Given farmer goes through the complete E2E journey', () => {
    it('Then the farmer is able to complete the SFI application', async () => {
      const username = '1100495932'
      const password = process.env.DEFRA_ID_USER_PASSWORD

      await HomePage.open()
      await expect(browser).toHaveTitle(`Sign in to your acccount`)
      await LoginPage.login(username, password)
      await expect(browser).toHaveTitle(new RegExp(`${SERVICE_NAME}`))
      const appRefNum = await runFundingApiJourney({ browser })
      console.log(`Application Reference Number: ${appRefNum}`)
    })
  })
})
