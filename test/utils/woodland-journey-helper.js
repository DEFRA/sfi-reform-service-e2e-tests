import { browser, $ } from '@wdio/globals'
import LoginPage from '../page-objects/login.page.js'
import WoodlandHomePage from '../page-objects/woodland.home.page.js'

/**
 * Login to the farmer portal and clear the woodland application state.
 *
 * @param {string} username - The CRN identifier.
 * @param {string} password - The farmer password.
 */
export async function clearWoodlandState(username, password) {
  await WoodlandHomePage.open()
  await LoginPage.login(username, password)
  await WoodlandHomePage.clearApplicationState()
  console.log('Woodland application state cleared')
}

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
  password
}) {
  await WoodlandHomePage.open()

  // ── Check details and start application ───────────────────────────────────
  // const startNowBtn = await $('button.govuk-button--start')
  // await startNowBtn.waitForClickable()
  // await startNowBtn.click()

  // Are these details correct? → Yes
  await (await $('#businessDetailsUpToDate')).click()
  await (await $('button[type="submit"]')).click()

  // ── Check your eligibility ─────────────────────────────────────────────────
  // Land registration → Yes
  await (await $('a[href="/woodland/eligibility-land-registered"]')).click()
  await (await $('#landRegisteredWithRpa')).click()
  await (await $('button[type="submit"]')).click()

  // Management control for the duration of the agreement → Yes
  await (await $('input[type="radio"][value="true"]')).click()
  await (await $('button[type="submit"]')).click()

  // Tenant of a public body? → No
  await (await $('#publicBodyTenant-2')).click()
  await (await $('button[type="submit"]')).click()

  // Common or shared grazing rights? → No
  await (await $('input[type="radio"][value="false"]')).click()
  await (await $('button[type="submit"]')).click()

  // Valid WMPs on any land in application? → No
  await (await $('input[type="radio"][value="false"]')).click()
  await (await $('button[type="submit"]')).click()

  // Intend to apply for CSHT agreement if WMP approved? → Yes
  await (await $('input[type="radio"][value="true"]')).click()
  await (await $('button[type="submit"]')).click()

  // ── About your woodland ────────────────────────────────────────────────────
  // Select land parcels → tick NT8701-9412
  await (await $('a[href="/woodland/land-parcels"]')).click()
  await (await $('#landParcels-3')).click()
  await (await $('button[type="submit"]')).click()

  // Woodland over 10 years old → 50 ha
  await (await $('#hectaresTenOrOverYearsOld')).setValue('50')
  await (await $('button[type="submit"]')).click()

  // Centre of your woodland → grid reference
  await (await $('#centreGridReference')).setValue('SP 4178 2432')
  await (await $('button[type="submit"]')).click()

  // Forestry commission team → North West and West Midlands
  await (await $('#fcTeamCode-2')).click()
  await (await $('button[type="submit"]')).click()

  // ── Check and submit application ───────────────────────────────────────────
  // Check your answers
  await (await $('a[href="/woodland/summary"]')).click()
  await (await $('button[type="submit"]')).click()

  // Potential funding → Continue
  await (await $('button[type="submit"]')).click()

  // Submit your application → Confirm and send
  await (await $('button[type="submit"]')).click()

  // ── Confirmation ───────────────────────────────────────────────────────────
  await browser.waitUntil(
    async () => (await browser.getUrl()).includes('/woodland/confirmation'),
    { timeout: 30000, timeoutMsg: 'Woodland confirmation page did not load' }
  )

  const refNumberEl = await $('.govuk-panel__body strong')
  await refNumberEl.waitForDisplayed()
  const appRefNum = (await refNumberEl.getText()).toLowerCase()

  await browser.takeScreenshot()
  console.log('Woodland Application Reference Number:', appRefNum)

  return { appRefNum }
}
