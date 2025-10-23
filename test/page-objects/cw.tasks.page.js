import BasePage from '../page-objects/cw.base.page.js'

class CWTasksPage extends BasePage {
  async approvalNotes() {
    const commentBox = await $('#approve-comment')
    await commentBox.setValue('This is my approval comment.')
  }
}

export default new CWTasksPage()
