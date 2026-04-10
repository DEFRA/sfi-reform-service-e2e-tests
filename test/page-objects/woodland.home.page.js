import { Page } from '../page-objects/page'

class WoodlandHomePage extends Page {
  open() {
    return super.open('/woodland/start')
  }

  clearApplicationState() {
    return super.open('/woodland/clear-application-state')
  }
}

export default new WoodlandHomePage()
