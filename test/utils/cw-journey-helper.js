import { browser } from '@wdio/globals'
import { entraLogin } from '../utils/cw-login-helper.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwAllCasesPage from '../page-objects/cw.allcases.page.js'

/** Farmer UI login, then HTTP funding journey; returns refs and leaves the app on home. */
export async function completeSFIJourney(appRefNum, consentRequired) {
  await browser.url(browser.options.cwUrl)
  const cwUsername = process.env.ENTRA_ID_ADMIN_USER
  const cwPassword = process.env.ENTRA_ID_USER_PASSWORD
  await entraLogin(cwUsername, cwPassword)
  const isReferenceInTable = await CWHomePage.waitUntilVisible(appRefNum)
  await expect(isReferenceInTable).toBe(true)
  await browser.pause(2000)
  await CWHomePage.clickLinkByText(appRefNum)
  await browser.pause(5000)

  await CwTasksPage.clickButtonByText('Start')
  await CwTasksPage.completeTask('Check customer details')
  await CwTasksPage.completeTask('Review land parcel rule checks')
  if (consentRequired) {
    await CwTasksPage.completeTask(
      'Check if any land parcels are within an SSSI'
    )
  }

  await CwTasksPage.completeTask('Check payment amount')
  await CwTasksPage.completeTask('Review scheme budget as a finance officer')

  await CwTasksPage.approveCaseWithComments('APPROVE_APPLICATION')

  await browser.pause(5000)
  await CwAllCasesPage.clickButtonByText('Confirm')
  await browser.pause(5000)

  await browser.refresh()
  await CwTasksPage.waitForElement('Agreements')

  await CwTasksPage.confirmTask('Check draft funding agreement')
  await CwTasksPage.confirmTask('Notify customer that agreement is ready')

  await CwTasksPage.approveAgreement('AGREEMENT_SENT')
  await CwAllCasesPage.clickButtonByText('Confirm')
}
