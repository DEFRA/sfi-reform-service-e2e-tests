import { browser } from '@wdio/globals'
import { loginAndRunFundingApiJourney } from '../utils/land-grants-journey-helper.js'
import { clearState } from '../utils/clear-sbi-state.js'
import { isEnvTrue } from '../utils/env-flags.js'
import { completeSFIJourney } from '../utils/cw-journey-helper.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

const heferEnabled = isEnvTrue('ENABLE_LAND_GRANT_HEFER_20260219')
const heferDescribe = heferEnabled ? describe : describe.skip

heferDescribe('SFI Application E2E Tests with HEFER consent @hefer', () => {
  it('The farmer is able to complete the SFI application', async () => {
    const username = '1106298365'
    const sbi = '106480734'
    const selectedLandParcel = 'NT8109-6898'
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
    await completeSFIJourney(appRefNum, consentRequired)

    // Agreements - Farmer Accepts Offer
  })
})
