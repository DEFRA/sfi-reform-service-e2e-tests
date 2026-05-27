import { browser } from '@wdio/globals'
import { loginAndRunFundingApiJourney } from '../utils/land-grants-journey-helper.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import CwTimelinePage from '../page-objects/cw.timeline.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
import { clearState } from '../utils/clear-sbi-state.js'
import { isEnvTrue } from '../utils/env-flags.js'
import { completeSFIJourney } from '../utils/cw-journey-helper.js'
import { completeAgreementJourney } from '../utils/agreement-journey-helper.js'
import CwTasksPage from 'page-objects/cw.tasks.page.js'

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
    const annualPaymentBreakdown = '£41.03 ( 1.1722 ha x £35.00 per ha )'
    const expectedTotalParcelArea = '1.1722'
    const expectedAnnualPaymentValue = '£41.03'
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
    await completeSFIJourney(appRefNum, consentRequired, annualPaymentBreakdown)
    const agreementsPageTitle = await CWAgreementsPage.headerH2()
    expect(agreementsPageTitle).toEqual('Customer Agreement Review')
    await CwTasksPage.clickLinkByText('Agreements')
    const agreementIdInitialJourney =
      await CWAgreementsPage.getFirstAgreementReferenceText()
    expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe('Offered')
    await browser.takeScreenshot()
    await browser.pause(5000)
    console.log(`agreementId :`, agreementIdInitialJourney)

    // Agreements - Farmer Accepts Offer
    await completeAgreementJourney('sssi')
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

    await CWAgreementsPage.viewAndValidateAgreementInNewTab({
      expectedTotalParcelArea,
      expectedAnnualPaymentValue
    })
  })
})
