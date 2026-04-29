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

export async function completeWoodlandJourney(appRefNum) {
  await browser.url(browser.options.cwUrl)
  const cwUsername = process.env.ENTRA_ID_ADMIN_USER
  const cwPassword = process.env.ENTRA_ID_USER_PASSWORD
  await entraLogin(cwUsername, cwPassword)
  const isReferenceInTable = await CWHomePage.waitUntilVisible(appRefNum)
  await expect(isReferenceInTable).toBe(true)
  await browser.pause(2000)
  await CWHomePage.clickLinkByText(appRefNum)
  await browser.pause(5000)

  // ── Reviewing Application ──────────────────────────────────────────────────
  // await CwTasksPage.clickButtonByText('Start')
  // await browser.pause(2000)

  // // Created CRM record task
  // await CwTasksPage.clickLinkByText('Created CRM record')
  // await CwTasksPage.selectRadioByValue('DONE')
  // await CwTasksPage.enterText(
  //   'DONE-comment',
  //   'CRM record has been created for this application'
  // )
  // await CwTasksPage.clickButtonByText('Confirm')
  // await browser.pause(2000)

  // // Assign to Forestry Commission
  // await CwTasksPage.enterText(
  //   'ACTION_ASSIGN_TO_FC-comment',
  //   'This is test explanation for auditing purposes'
  // )
  // await CwTasksPage.clickButtonByText('Assign to Forestry Commission')
  // await browser.pause(2000)

  // // ── Awaiting Forestry Commission ───────────────────────────────────────────
  // // FC approved task
  // await CwTasksPage.clickLinkByText('FC approved')
  // await CwTasksPage.selectRadioByValue('YES')
  // await CwTasksPage.enterText('YES-comment', 'FC happy with approval')
  // await CwTasksPage.clickButtonByText('Confirm')
  // await browser.pause(2000)

  // // FC response matches application task
  // await CwTasksPage.clickLinkByText('FC response matches application')
  // await CwTasksPage.selectRadioByValue('YES')
  // await CwTasksPage.enterText('YES-comment', 'FC response matches application')
  // await CwTasksPage.clickButtonByText('Confirm')
  // await browser.pause(2000)

  // // Decision: Approve
  // await CwTasksPage.selectRadioByValue('ACTION_APPROVE_FOR_FC')
  // await CwTasksPage.enterText('ACTION_APPROVE_FOR_FC-comment', 'Looks all good')
  // await CwTasksPage.clickButtonByText('Confirm')

  // // Wait and verify status is 'Agreement Generating'
  // await browser.pause(5000)
  // await browser.waitUntil(
  //   async () => {
  //     await browser.refresh()
  //     const pageSource = await browser.getPageSource()
  //     return pageSource.includes('Agreement Generating')
  //   },
  //   {
  //     timeout: 30000,
  //     interval: 3000,
  //     timeoutMsg: 'Status did not change to "Agreement Generating"'
  //   }
  // )
  await browser.takeScreenshot()
}

export async function initiateTerminateSFIJourney() {
  await CwTasksPage.enterText(
    'INITIATE_TERMINATION-comment',
    'Initiate SFI Journey'
  )
  await CwTasksPage.clickButtonByText('Terminate')

  // await CwTasksPage.waitForElement('Termination preparation tasks')

  await CwTasksPage.confirmTask('Check for payment recovery')
  await CwTasksPage.confirmTask(
    'Notify Agreement Holder of agreement termination'
  )

  await browser.pause(1000)
  await CwTasksPage.approveCaseWithComments('TERMINATE_AGREEMENT')

  await CwTasksPage.selectRadioByValue('TERMINATE_AGREEMENT')
  await CwTasksPage.clickButtonByText('Confirm')

  await CwTasksPage.selectRadioByValue('yes')
  await browser.pause(1000)

  await CwTasksPage.clickButtonByText('Confirm')
}
