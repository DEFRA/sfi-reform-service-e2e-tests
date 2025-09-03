import { browser, $ } from '@wdio/globals'

class Page {
  get pageHeading() {
    return $('h1')
  }

  open(path) {
    return browser.url(path)
  }

  async clickButton(selector) {
    const button = await $("button[type='submit']")
    await button.click()
  }
}

export { Page }
