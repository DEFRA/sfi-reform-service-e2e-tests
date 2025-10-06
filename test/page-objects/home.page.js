import { Page } from 'page-objects/page'

class HomePage extends Page {
  open() {
    return super.open('/farm-payments')
  }
}

export default new HomePage()
