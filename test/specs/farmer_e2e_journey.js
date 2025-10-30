import { browser } from '@wdio/globals'
import HomePage from '../page-objects/home.page.js'
import LoginPage from '../page-objects/login.page.js'
import { SERVICE_NAME } from '../utils/config.js'
import { runFundingApiJourney } from '../utils/journey-api.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import { entraLogin } from '../utils/cw-login-helper.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwAllCasesPage from '../page-objects/cw.allcases.page.js'
import CwApplicationPage from '../page-objects/cw.application.page.js'
import CwTimelinePage from '../page-objects/cw.timeline.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
import AgreementReviewOfferPage from '../page-objects/agreements.review.offer.page.js'
import AgreementsAcceptYourOfferPage from '../page-objects/agreements.accept.your.offer.page.js'
import AgreementOfferAcceptedPage from '../page-objects/agreements.offer.accepted.page.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('SFI Application E2E Tests', () => {
  describe('Given farmer goes through the complete E2E journey', () => {
    it('Then the farmer is able to complete the SFI application', async () => {
      const username = '1100495932'
      const password = process.env.DEFRA_ID_USER_PASSWORD

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

      await CwTasksPage.clickLinkByText('Simple Review')
      await CwTasksPage.setCheckbox('Simple Review')
      await CwTasksPage.clickButtonByText('Save and continue')
      await browser.pause(5000)

      await CwAllCasesPage.selectRadioByValue('approve')
      await CwTasksPage.approvalNotes()
      await CwAllCasesPage.clickButtonByText('Save')
      await browser.pause(5000)

      const actualApprovalText = await CwApplicationPage.headerH2()
      await expect(actualApprovalText).toEqual('Stage for contract management')
      await browser.pause(5000)
      await CwTasksPage.waitForElement('Agreements')
      await browser.pause(5000)
      await CwTimelinePage.clickLinkByText('Agreements')
      await browser.pause(5000)
      const agreementsPageTitle = await CWAgreementsPage.headerH2()
      expect(agreementsPageTitle).toEqual('Case grant funding agreement')

      const agreementIdInitialJourney =
        await CWAgreementsPage.getFirstAgreementReferenceText()
      expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
        'Offered'
      )
      await browser.takeScreenshot()
      await browser.pause(5000)
      console.log(`agreementId :`, agreementIdInitialJourney)

      // Agreements - Farmer Accepts Offer
      await browser.url(
        browser.options.agreementsUrl + agreementIdInitialJourney
      )
      await browser.pause(5000)
      await AgreementReviewOfferPage.selectContinue()
      await AgreementsAcceptYourOfferPage.selectAcceptOffer()
      const confirmationText =
        await AgreementOfferAcceptedPage.getConfirmationText()
      expect(confirmationText).toBe('Offer accepted')
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
