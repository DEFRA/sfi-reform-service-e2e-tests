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
      await HomePage.open()
      await expect(browser).toHaveTitle(`Sign in to your acccount`)
      await LoginPage.login('1100506632', 'Password456')
      await expect(browser).toHaveTitle(`Start page | ${SERVICE_NAME}`)
      await runFundingApiJourney({ browser })
    })
  })
})
