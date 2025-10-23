import BasePage from '../page-objects/cw.base.page.js'

class CWAgreementsPage extends BasePage {
  get firstAgreementReference() {
    return $('table.govuk-table tbody tr td:first-child span')
  }

  get firstAgreementStatus() {
    return $('table.govuk-table tbody tr td:nth-child(4) .govuk-tag')
  }

  async getFirstAgreementReferenceText() {
    return await this.firstAgreementReference.getText()
  }

  async getFirstAgreementStatusText() {
    return await this.firstAgreementStatus.getText()
  }
}

export default new CWAgreementsPage()
