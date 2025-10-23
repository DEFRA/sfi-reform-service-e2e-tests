import BasePage from '../page-objects/cw.base.page.js'

class CWApplicationPage extends BasePage {
  async headerH2() {
    const h2Element = await $('h2')
    return await h2Element.getText()
  }
}

export default new CWApplicationPage()
