import BasePage from '../page-objects/cw.base.page.js'

class CWTasksPage extends BasePage {
  async approvalNotes(actionCode) {
    const selector = `#${actionCode}-comment`
    const commentBox = await $(selector)

    await commentBox.waitForDisplayed()
    await commentBox.setValue(`#${actionCode}-comment`)
  }

  async acceptedNotes(notes) {
    const commentBox = await $('#comment')
    await commentBox.setValue(notes)
  }

  async approveCaseWithComments(approveApplication) {
    await this.selectRadioByValue(approveApplication)
    await this.approvalNotes(approveApplication)
  }

  async handleTask(taskName, radioValue) {
    await this.clickLinkByText(taskName)
    await this.selectRadioByValue(radioValue)
    await this.acceptedNotes(taskName)
    await this.clickButtonByText('Save and continue')
  }

  async confirmTask(taskName) {
    await this.handleTask(taskName, 'confirm')
  }

  async completeTask(taskName) {
    await this.handleTask(taskName, 'ACCEPTED')
  }

  async approveAgreement(agreementsent) {
    await this.selectRadioByValue(agreementsent)
  }
}

export default new CWTasksPage()
