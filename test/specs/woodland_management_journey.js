import { browser } from '@wdio/globals'
import { completeWoodlandJourney } from '../utils/cw-journey-helper.js'
import {
  clearWoodlandState,
  loginAndRunWoodlandManagementJourney
} from '../utils/woodland-journey-helper.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('Woodland Management Plan E2E Tests', () => {
  it('The farmer is able to complete the Woodland Management Plan application', async () => {
    const username = '1106298365'
    const password = process.env.DEFRA_ID_USER_PASSWORD

    // Clear any in-progress woodland application state
    await clearWoodlandState(username, password)

    // Complete the woodland application journey via the UI
    const { appRefNum } = await loginAndRunWoodlandManagementJourney({
      username,
      password
    })

    // CW Approval Process
    console.log('App Ref Num: ' + appRefNum)
    await completeWoodlandJourney(appRefNum)

    // TODO: completeAgreementJourney() - agreement journey not yet implemented for woodland management
  })
})
