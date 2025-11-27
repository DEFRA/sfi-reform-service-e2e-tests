/**
 * Clear the SBI state for a given SBI and grant code by making a DELETE request to the backend API.
 *
 * @param {string} sbi - The SBI identifier.
 * @param {string} grantCode - The grant code associated with the SBI.
 */
export async function clearState(sbi, grantCode) {
  // If RUN_ENV is not set or not 'local', use the environment backend URL
  // Otherwise use the ephemeral test backend URL
  const backendUrl =
    !process.env.RUN_ENV || process.env.RUN_ENV !== 'local'
      ? process.env.GRANTS_UI_BACKEND_URL
      : 'https://ephemeral-protected.api.test.cdp-int.defra.cloud/grants-ui-backend'

  // If RUN_ENV is not set or not 'local', use the headers without x-api-key
  // Otherwise use the headers with x-api-key
  const headers =
    !process.env.RUN_ENV || process.env.RUN_ENV !== 'local'
      ? {
          Authorization: `Bearer ${process.env.GRANTS_UI_BACKEND_API_TOKEN}`
        }
      : {
          'x-api-key': process.env.GRANTS_UI_BACKEND_API_KEY,
          Authorization: `Bearer ${process.env.GRANTS_UI_BACKEND_API_TOKEN}`
        }

  const response = await fetch(
    `${backendUrl}/state?sbi=${sbi}&grantCode=${grantCode}`,
    {
      method: 'DELETE',
      headers
    }
  )
  await expect(response.status === 200 || response.status === 404).toBe(true)
}
