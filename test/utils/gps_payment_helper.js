import {
  getGrantPaymentById,
  cancelPayment,
  processPayments
} from './grant_payments_service.js'

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
    const hasPendingPayment = recordData?.grants?.[0]?.payments?.some(
      (payment) => payment.status === 'pending'
    )
    if (hasPendingPayment) {
      console.log(`Pending payment found for SBI ${sbi}`)
      break
    }
    console.log(
      `No pending payment found for SBI ${sbi}, retrying... (${retries - 1} retries left)`
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

  // Process all 4 payments
  for (const [index, payment] of payments.entries()) {
    const currentDueDate = payment.dueDate

    console.log(
      `\nProcessing Payment ${index + 1} for Due Date ${currentDueDate}`
    )

    // Verify payment starts pending
    expect(payment.status).toBe('pending')

    // Process payment
    const { statusCode, body: processResult } =
      await processPayments(currentDueDate)

    expect(statusCode).toBe(200)

    // Basic response checks
    expect(processResult).toBeDefined()
    expect(processResult.result.length).toBeGreaterThan(0)

    const processedItem = processResult.result.find(
      (item) => item.body.sbi === sbi
    )

    expect(processedItem).toBeDefined()
    console.log('processedItem:', JSON.stringify(processedItem, null, 2))

    // Basic payload checks
    expect(processedItem.body.sbi).toBe(sbi)
    expect(processedItem.body.frn).toBe(frn)
    expect(processedItem.body.dueDate).toBeDefined()
    expect(processedItem.body.correlationId).toBe(payment.correlationId)

    // Verify status updated in DB
    const { body: updatedRecord } = await getGrantPaymentById(sbi)
    const updatedData = Array.isArray(updatedRecord.docs)
      ? updatedRecord.docs[0]
      : updatedRecord
    const updatedPaymentStatus = updatedData.grants[0].payments[index].status
    console.log(`Payment ${index + 1} status: ${updatedPaymentStatus}`)
    expect(updatedPaymentStatus).toBe('submitted')
  }
  // GPS Checks End
}
