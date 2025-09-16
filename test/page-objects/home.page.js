import { Page } from 'page-objects/page'

class HomePage extends Page {
  open() {
    return super.open('/find-funding-for-land-or-farms/start')
  }
}

export default new HomePage()
