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
}

export default new CWAgreementsPage()
