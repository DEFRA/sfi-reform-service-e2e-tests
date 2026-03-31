import { browser, expect } from '@wdio/globals'
import AgreementReviewOfferPage from 'page-objects/agreements.review.offer.page.js'
import AgreementsAcceptYourOfferPage from 'page-objects/agreements.accept.your.offer.page.js'
import AgreementOfferAcceptedPage from 'page-objects/agreements.offer.accepted.page.js'
import * as constants from './constants.js'

const consentConfig = {
  ssi: {
    heading: constants.SSSI_ONLY_HEADING
  },
  hefer: {
    heading: constants.HEFER_ONLY_HEADING
  }
}

export async function completeAgreementJourney(consent) {
  // Agreements - Farmer Accepts Offer
  await browser.url(browser.options.agreementsUrl)
  await browser.pause(5000)

  await AgreementReviewOfferPage.selectContinue()
  await AgreementsAcceptYourOfferPage.clickConfirmCheckbox()
  await AgreementsAcceptYourOfferPage.selectAcceptOffer()

  const confirmationText =
    await AgreementOfferAcceptedPage.getConfirmationText()
  expect(confirmationText).toBe('Agreement offer accepted')

  const config = consentConfig[consent]

  if (config) {
    const heading = await AgreementOfferAcceptedPage.getSectionHeading(
      config.heading
    )
    await expect(heading).toBeDisplayed()
  }

  await browser.takeScreenshot()
}
