import { browser, expect } from '@wdio/globals'
import { resolveBackendUrl } from './backend-url.js'

function backendUrl() {
  return resolveBackendUrl({ baseBackendUrl: browser.options.baseBackendUrl })
}

function backendHeaders(headers = {}) {
  const authHeaders = {
    Authorization: `Bearer ${process.env.GRANTS_UI_BACKEND_API_TOKEN}`,
    ...headers
  }

  if (
    process.env.RUN_ENV === 'local' &&
    process.env.GRANTS_UI_BACKEND_API_KEY
  ) {
    return {
      'x-api-key': process.env.GRANTS_UI_BACKEND_API_KEY,
      ...authHeaders
    }
  }

  return authHeaders
}

class Backend {
  /**
   * Clears all test data (state, submissions, locks) for a given SBI
   * via the backend's /admin/test-data endpoint. Only permitted in
   * non-production environments.
   */
  async clearTestData(sbi, grantCode) {
    const url = `${backendUrl()}/admin/test-data?sbi=${sbi}&grantCode=${grantCode}`
    console.log(`Clearing test data via ${url}`)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: backendHeaders()
    })

    console.log(
      `Clear test data response for SBI ${sbi}, grantCode ${grantCode}: ${response.status} ${response.statusText}`
    )
    await expect(response.status).toBe(200)
  }
}

export default new Backend()
