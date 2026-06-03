import { browser } from '@wdio/globals'
import { loginAndRunFundingApiJourney } from '../utils/land-grants-journey-helper.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwTimelinePage from '../page-objects/cw.timeline.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
import { clearState } from '../utils/clear-sbi-state.js'
import { completeSFIJourney } from '../utils/cw-journey-helper.js'
import { completeAgreementJourney } from '../utils/agreement-journey-helper.js'

afterEach(async () => {
  await browser.deleteCookies()
})

const actionJourneyCases = [
  {
    landAction: 'CLIG3',
    username: '1103623923',
    sbi: '107365747',
    selectedLandParcel: 'SD7758-7429',
    annualPaymentBreakdown: '£544.48 ( 3.6058 ha x £151.00 per ha )',
    expectedTotalParcelArea: '3.6058',
    expectedAnnualPaymentValue: '£544.48'
  },
  {
    landAction: 'UPL8',
    username: '1106298365',
    sbi: '106480734',
    selectedLandParcel: 'NT8109-6898',
    annualPaymentBreakdown: '£5.88 ( 0.0795 ha x £74.00 per ha )',
    expectedTotalParcelArea: '0.0795',
    expectedAnnualPaymentValue: '£5.88'
  }
]

describe('SFI Application E2E Tests for land parcels with single action and no consent', () => {
  actionJourneyCases.forEach(
    ({
      landAction,
      username,
      sbi,
      selectedLandParcel,
      annualPaymentBreakdown,
      expectedTotalParcelArea,
      expectedAnnualPaymentValue
    }) => {
      it(`The farmer is able to complete the SFI application for ${landAction}`, async () => {
        const consentRequired = false
        const password = process.env.DEFRA_ID_USER_PASSWORD

        await clearState(username, sbi, 'farm-payments')
        await browser.pause(5000)

        const { appRefNum } = await loginAndRunFundingApiJourney({
          username,
          password,
          sbi,
          selectedLandParcel,
          landAction,
          consentRequired
        })

        console.log('App Ref Num: ' + appRefNum)
        await completeSFIJourney(
          appRefNum,
          consentRequired,
          annualPaymentBreakdown
        )

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

        await completeAgreementJourney()

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
    }
  )
})
