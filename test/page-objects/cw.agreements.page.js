import BasePage from '../page-objects/cw.base.page.js'

class CWAgreementsPage extends BasePage {
  get firstAgreementReference() {
    return $$('dl div dd')[1]
  }

  get firstAgreementStatus() {
    return $$('dl div dd')[0]
  }

  async getFirstAgreementReferenceText() {
    return await this.firstAgreementReference.getText()
  }

  async getFirstAgreementStatusText() {
    return this.firstAgreementStatus.getText()
  }

  get agreementStatusTag() {
    return $('.govuk-summary-list__value .govuk-tag')
  }

  async waitForAgreementToBeTerminated({
    timeout = 60000,
    interval = 3000,
    status = 'Terminated'
  } = {}) {
    let lastStatus = ''

    await browser.waitUntil(
      async () => {
        await browser.refresh()

        const statusElement = await this.agreementStatusTag

        await statusElement.waitForDisplayed({ timeout: 10000 })

        const statusText = (await statusElement.getText()).trim()

        lastStatus = statusText

        console.log(`Current agreement status: ${statusText}`)

        return statusText === status
      },
      {
        timeout,
        interval,
        timeoutMsg: `Agreement status did not become "Terminated" in time. Last status: ${lastStatus}`
      }
    )
  }
}

export default new CWAgreementsPage()
