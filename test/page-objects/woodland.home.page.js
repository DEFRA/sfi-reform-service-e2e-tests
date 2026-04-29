import { browser, $ } from '@wdio/globals'
import { Page } from '../page-objects/page'

class WoodlandHomePage extends Page {
  open() {
    return super.open('/woodland/check-details')
  }

  clearApplicationState() {
    return super.open('/woodland/clear-application-state')
  }

  async completeCheckDetails() {
    await this.selectRadioById('businessDetailsUpToDate')
    await this.submit()
  }

  async completeEligibility() {
    await this.clickHref('/woodland/eligibility-land-registered')
    await this.waitForUrlIncludes('/woodland/eligibility-land-registered')
    await this.selectRadioById('landRegisteredWithRpa')
    await this.submit()

    await this.selectRadioById('landManagementControl')
    await this.submit()

    await this.selectRadioById('publicBodyTenant-2')
    await this.submit()

    await this.selectRadioById('landHasGrazingRights-2')
    await this.submit()

    await this.selectRadioById('appLandHasExistingWmp-2')
    await this.submit()

    await this.selectRadioById('intendToApplyHigherTier')
    await this.submit()
  }

  async completeWoodlandDetails({
    landParcelId,
    hectaresTenOrOverYearsOld,
    centreGridReference,
    woodlandName,
    fcTeamCodeId
  }) {
    await this.clickHref('/woodland/land-parcels')
    await this.waitForUrlIncludes('/woodland/land-parcels')
    await this.selectCheckboxByValue(landParcelId)
    await this.submit()

    await this.typeById(
      'hectaresTenOrOverYearsOld',
      String(hectaresTenOrOverYearsOld)
    )
    await this.submit()

    await this.typeById('centreGridReference', centreGridReference)
    await this.submit()

    await this.typeById('woodlandName', woodlandName)
    await this.submit()

    await this.selectRadioById(fcTeamCodeId)
    await this.submit()
  }

  async submitApplication() {
    await this.clickHref('/woodland/summary')
    await this.waitForUrlIncludes('/woodland/summary')
    await this.submit()
    await this.submit()
    await this.submit()
  }

  async getApplicationReference() {
    const refNumberEl = await $('.govuk-panel__body strong')
    await refNumberEl.waitForDisplayed()
    return (await refNumberEl.getText()).toLowerCase()
  }

  async submit() {
    const submitButton = await $('button[type="submit"]')
    await submitButton.waitForClickable()
    await submitButton.click()
  }

  async selectRadioById(id) {
    const label = await $(`label[for="${id}"]`)
    if (await label.isExisting()) {
      await label.waitForClickable()
      await label.click()
      return
    }

    const radio = await $(`#${id}`)
    await radio.waitForExist()
    await browser.execute((el) => el.click(), radio)
  }

  async selectCheckboxByValue(value) {
    const safeValue = String(value).replace(/"/g, '\\"')
    const checkbox = await $(`input[type="checkbox"][value="${safeValue}"]`)

    await checkbox.waitForExist({
      timeout: 50000,
      timeoutMsg: `Checkbox with value "${value}" was not found`
    })

    if (await checkbox.isSelected()) {
      return
    }

    const checkboxId = await checkbox.getAttribute('id')
    if (checkboxId) {
      const label = await $(`label[for="${checkboxId}"]`)
      if (await label.isExisting()) {
        await label.waitForClickable()
        await label.click()
        return
      }
    }

    await browser.execute((el) => el.click(), checkbox)
  }

  async typeById(id, value) {
    const input = await $(`#${id}`)
    await input.waitForDisplayed()
    await input.clearValue()
    await input.setValue(value)
  }

  async waitForUrlIncludes(path, timeout = 50000) {
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes(path),
      {
        timeout,
        timeoutMsg: `Expected URL to include "${path}" but it did not`
      }
    )
  }

  async clickHref(path) {
    const link = await $(`a[href="${path}"]`)
    await link.waitForClickable({
      timeout: 50000,
      timeoutMsg: `Link with href "${path}" was not clickable`
    })
    await link.click()
  }
}

export default new WoodlandHomePage()
