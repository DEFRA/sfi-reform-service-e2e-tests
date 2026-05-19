import { getGrantPaymentById, cancelPayment } from './grant_payments_service.js'

export const cancelExistingPayments = async (sbi, frn) => {
  const cancelData = {
    sbi,
    frn
  }
  await cancelPayment(cancelData)
}

export const runGpsPaymentChecks = async (sbi, frn) => {
  // GPS Checks start
  let recordData
  let retries = 10
  const retryDelay = 15000

  while (retries > 0) {
    const { body: record } = await getGrantPaymentById(sbi)
    recordData = record?.docs?.[0]

    // Retry until recordData exists
    if (recordData) {
      console.log(`Record found for SBI ${sbi}`)
      break
    }

    console.log(
      `No record found for SBI ${sbi}, retrying... (${retries - 1} retries left)`
    )

    await new Promise((resolve) => setTimeout(resolve, retryDelay))
    retries--
  }

  console.log(`Matched record:\n${JSON.stringify(recordData, null, 2)}`)

  // Basic GPS checks
  expect(recordData).toBeDefined()
  expect(recordData.sbi).toBe(sbi)
  expect(recordData.frn).toBe(frn)
  expect(recordData.grants).toHaveLength(1)

  const payments = recordData.grants[0].payments
  expect(payments).toHaveLength(4)
}
