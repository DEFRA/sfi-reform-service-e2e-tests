import { browser } from '@wdio/globals'
import { loginAndRunFundingApiJourney } from '../utils/land-grants-journey-helper.js'
import { clearState } from '../utils/clear-sbi-state.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('SFI Application E2E Tests with SSSI consent', () => {
  it('The farmer is able to complete the SFI application', async () => {
    const username = '1103313150'
    const sbi = '106514040'
    const selectedLandParcel = 'SK0971-7555'
    const landAction = 'CMOR1'
    const consentRequired = true
    const password = process.env.DEFRA_ID_USER_PASSWORD
    // clear sbi state before starting a new application
    await clearState(username, sbi, 'farm-payments')

    const { appRefNum } = await loginAndRunFundingApiJourney({
      username,
      password,
      sbi,
      selectedLandParcel,
      landAction,
      consentRequired
    })
    // CW Approval Process
    console.log('App Ref Num: ' + appRefNum)

    // Agreements - Farmer Accepts Offer
  })
})
