import { browser } from '@wdio/globals'
import { loginAndRunFundingApiJourney } from '../utils/land-grants-journey-helper.js'
import { clearState } from '../utils/clear-sbi-state.js'
import { isEnvTrue } from '../utils/env-flags.js'
import { completeSFIJourney } from '../utils/cw-journey-helper.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

const sssiEnabled = isEnvTrue('ENABLE_LAND_GRANT_SSSI_20260122')
const sssiDescribe = sssiEnabled ? describe : describe.skip

sssiDescribe('SFI Application E2E Tests with SSSI consent @sssi', () => {
  it('The farmer is able to complete the SFI application', async () => {
    const username = '1103313150'
    const sbi = '106514040'
    const selectedLandParcel = 'SK0971-7555'
    const landAction = 'UPL1'
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
  })
})
