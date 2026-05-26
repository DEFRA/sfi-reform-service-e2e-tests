import { browser } from '@wdio/globals'
import { completeWoodlandJourney } from '../utils/cw-journey-helper.js'
import { loginAndRunWoodlandManagementJourney } from '../utils/woodland-journey-helper.js'
import { clearState } from '~/test/utils/clear-sbi-state.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('Woodland Management Plan E2E Tests', () => {
  it('The farmer is able to complete the Woodland Management Plan application', async () => {
    const testUser = {
      username: '1106298365',
      password: process.env.DEFRA_ID_USER_PASSWORD
    }

    const woodlandApplicationData = {
      landParcelId: 'NT8701-9412',
      hectaresTenOrOverYearsOld: 50,
      centreGridReference: 'SP 4178 2432',
      woodlandName: 'Ashbrook WD',
      fcTeamCodeId: 'fcTeamCode-2'
    }

    const { username, password } = testUser

    // Clear application state
    const sbi = '106480734'
    await clearState(username, sbi, 'woodland')
    console.log('Woodland application state cleared')

    // Complete the woodland application journey via the UI
    const { appRefNum } = await loginAndRunWoodlandManagementJourney({
      username,
      password,
      applicationData: woodlandApplicationData
    })

    // CW Approval Process
    console.log('App Ref Num: ' + appRefNum)
    await completeWoodlandJourney(appRefNum)

    // TODO: completeAgreementJourney() - agreement journey not yet implemented for woodland management
  })
})
