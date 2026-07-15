import { mintLockToken } from './lock-token'

// The live grantVersion each grant is currently pinned at. clearState must
// target this version explicitly - the backend defaults grantVersion to
// '1.0.0' when omitted, which silently misses the real state/lock records
// once a grant has moved past that version.
const GRANT_VERSIONS = {
  'farm-payments': '1.2.0',
  woodland: '1.4.0'
}

/**
 * Clear the SBI state for a given SBI and grant code by making a DELETE request to the backend API.
 *
 * @param {string} crn - The CRN identifier.
 * @param {string} sbi - The SBI identifier.
 * @param {string} grantCode - The grant code associated with the SBI.
 */
export async function clearState(crn, sbi, grantCode) {
  const grantVersion = GRANT_VERSIONS[grantCode]
  // If RUN_ENV is not set or not 'local', use the environment backend URL
  // Otherwise use the ephemeral test backend URL
  const backendUrl =
    process.env.RUN_ENV !== 'local'
      ? `https://grants-ui-backend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
      : `https://ephemeral-protected.api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud/grants-ui-backend`
  console.log(
    `Clearing state for CRN ${crn}, SBI ${sbi}, grantCode ${grantCode}, grantVersion ${grantVersion} via ${backendUrl}`
  )

  // If RUN_ENV is not set or not 'local', use the headers without x-api-key
  // Otherwise use the headers with x-api-key
  const headers =
    process.env.RUN_ENV !== 'local'
      ? {
          Authorization: `Bearer ${process.env.GRANTS_UI_BACKEND_API_TOKEN}`,
          'x-application-lock-owner': mintLockToken(
            crn,
            sbi,
            grantCode,
            grantVersion
          )
        }
      : {
          'x-api-key': process.env.GRANTS_UI_BACKEND_API_KEY,
          Authorization: `Bearer ${process.env.GRANTS_UI_BACKEND_API_TOKEN}`,
          'x-application-lock-owner': mintLockToken(
            crn,
            sbi,
            grantCode,
            grantVersion
          )
        }

  const response = await fetch(
    `${backendUrl}/state?sbi=${sbi}&grantCode=${grantCode}&grantVersion=${grantVersion}`,
    {
      method: 'DELETE',
      headers
    }
  )
  console.log(
    `Clear state response for SBI ${sbi}: ${response.status} ${response.statusText}`
  )
  await expect(response.status === 200 || response.status === 404).toBe(true)
}
