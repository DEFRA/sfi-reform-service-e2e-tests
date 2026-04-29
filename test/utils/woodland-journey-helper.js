import { browser, $ } from '@wdio/globals'
import LoginPage from '../page-objects/login.page.js'
import WoodlandHomePage from '../page-objects/woodland.home.page.js'

/**
 * Complete the Woodland Management Plan application journey via the UI.
 * Assumes the farmer session is already established (i.e. clearWoodlandState was called first).
 *
 * @param {string} username - The CRN identifier (unused in UI flow but kept for symmetry).
 * @param {string} password - Unused; kept for symmetry with other journey helpers.
 * @returns {{ appRefNum: string }} The woodland application reference number.
 */
export async function loginAndRunWoodlandManagementJourney({
  username,
  password,
  applicationData = {}
}) {
  await WoodlandHomePage.open()
  await loginAndValidate(username, password)
  await WoodlandHomePage.clearApplicationState()
  await browser.pause(3000)
  console.log('Woodland application state cleared')
  await browser.pause(3000)

  const journeyData = {
    landParcelId: 'NT8701-9412',
    hectaresTenOrOverYearsOld: '50',
    centreGridReference: 'SP 4178 2432',
    woodlandName: 'Ashbrook WD',
    fcTeamCodeId: 'fcTeamCode-2',
    ...applicationData
  }

  await WoodlandHomePage.completeCheckDetails()
  await WoodlandHomePage.completeEligibility()
  await WoodlandHomePage.completeWoodlandDetails(journeyData)
  await WoodlandHomePage.submitApplication()

  // ── Confirmation ───────────────────────────────────────────────────────────
  await browser.waitUntil(
    async () => (await browser.getUrl()).includes('/woodland/confirmation'),
    { timeout: 30000, timeoutMsg: 'Woodland confirmation page did not load' }
  )

  const appRefNum = await WoodlandHomePage.getApplicationReference()

  await browser.takeScreenshot()
  console.log('Woodland Application Reference Number:', appRefNum)

  return { appRefNum }
}

async function loginIfRequired(username, password) {
  const loginInput = await $('#crn')
  const loginPageVisible = await loginInput
    .waitForExist({
      timeout: 5000,
      timeoutMsg: 'Login form did not appear',
      reverse: false
    })
    .catch(() => false)

  if (loginPageVisible) {
    await LoginPage.login(username, password)
  }
}

async function loginAndValidate(username, password) {
  await loginIfRequired(username, password)

  await browser.waitUntil(
    async () => {
      const loginInput = await $('#crn')
      return !(await loginInput.isExisting())
    },
    {
      timeout: 50000,
      timeoutMsg: 'Login validation failed: still on login page'
    }
  )

  const detailsRadio = await $('#businessDetailsUpToDate')
  await detailsRadio.waitForExist({
    timeout: 50000,
    timeoutMsg: 'Login validation failed: check-details page did not load'
  })
}
