import { browser } from '@wdio/globals'
import HomePage from '../page-objects/home.page.js'
import LoginPage from '../page-objects/login.page.js'
import { SERVICE_NAME } from '../utils/config.js'
import { runFundingApiJourney } from '../utils/journey-api.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import { entraLogin } from '../utils/cw-login-helper.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwAllCasesPage from '../page-objects/cw.allcases.page.js'
import CwTimelinePage from '../page-objects/cw.timeline.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
import AgreementReviewOfferPage from '../page-objects/agreements.review.offer.page.js'
import AgreementsAcceptYourOfferPage from '../page-objects/agreements.accept.your.offer.page.js'
import AgreementOfferAcceptedPage from '../page-objects/agreements.offer.accepted.page.js'
import { clearState } from '../utils/clear-sbi-state.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('SFI Application E2E Tests', () => {
  describe('Given farmer goes through the complete E2E journey', () => {
    it('Then the farmer is able to complete the SFI application', async () => {
      const username = '1103313150'
      const sbi = '106514040'
      const password = process.env.DEFRA_ID_USER_PASSWORD
      // clear sbi state before starting a new application
      await clearState(sbi, 'farm-payments')

      // Farmer Login and Application Submission through Land Grants Journey
      await HomePage.open()
      await expect(browser).toHaveTitle(`Sign in to your acccount`)
      await LoginPage.login(username, password)
      await expect(browser).toHaveTitle(new RegExp(`${SERVICE_NAME}`))
      const appRef = await runFundingApiJourney({ browser })
      const appRefNum = appRef.referenceNumber.toString().toLowerCase()
      await HomePage.open()
      await browser.pause(5000)
      await browser.takeScreenshot()
      console.log(`Application Reference Number:`, appRefNum)
      // CW Approval Process
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
      await CwTasksPage.completeTask(
        'Check if any land parcels are within an SSSI'
      )
      await CwTasksPage.completeTask('Check payment amount')
      await CwTasksPage.completeTask(
        'Review scheme budget as a finance officer'
      )

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

      const agreementsPageTitle = await CWAgreementsPage.headerH2()
      expect(agreementsPageTitle).toEqual('Customer Agreement Review')

      await CwTasksPage.clickLinkByText('Agreements')

      const agreementIdInitialJourney =
        await CWAgreementsPage.getFirstAgreementReferenceText()
      expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
        'Offered'
      )
      await browser.takeScreenshot()
      await browser.pause(5000)
      console.log(`agreementId :`, agreementIdInitialJourney)

      // Agreements - Farmer Accepts Offer
      await browser.url(browser.options.agreementsUrl)
      await browser.pause(5000)
      await AgreementReviewOfferPage.selectContinue()
      await AgreementsAcceptYourOfferPage.clickConfirmCheckbox()
      await AgreementsAcceptYourOfferPage.selectAcceptOffer()
      const confirmationText =
        await AgreementOfferAcceptedPage.getConfirmationText()
      expect(confirmationText).toBe('Agreement offer accepted')
      await browser.takeScreenshot()
      // Case Working - Verify Agreement Status after Farmer Accepts Offer
      await browser.pause(5000)
      await browser.url(browser.options.cwUrl)
      await CWHomePage.clickLinkByText(appRefNum)
      await browser.pause(5000)
      await CwTimelinePage.clickLinkByText('Agreements')
      await browser.pause(5000)
      const agreementIdOnReturn =
        await CWAgreementsPage.getFirstAgreementReferenceText()
      expect(agreementIdInitialJourney).toBe(agreementIdOnReturn)
      expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
        'Accepted'
      )
      await browser.pause(5000)
    })
  })
})
