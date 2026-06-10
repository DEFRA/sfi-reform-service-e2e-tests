import {
  getGrantPaymentById,
  deleteGrantPaymentsById,
  processPaymentsBySbi
} from './grant_payments_service.js'

export const clearExistingPayments = async (sbi) => {
  await deleteGrantPaymentsById(sbi)
  const getResponse = await getGrantPaymentById(sbi)
  expect(getResponse.statusCode).toBe(200)
  expect(getResponse.body.docs).toHaveLength(0)
}

export const runGpsPaymentChecks = async (sbi) => {
  console.log('runGpsPaymentChecks: -> ')
  const getGrantPaymentByIdWithRetry = async (
    sbi,
    { maxRetries = 10, delayMs = 2000, validate } = {}
  ) => {
    let lastResult
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await getGrantPaymentById(sbi)
      lastResult = result

      const record = Array.isArray(result.body.docs)
        ? result.body.docs[0]
        : result.body

      if (!validate || validate(record)) {
        return result
      }

      if (attempt < maxRetries) {
        console.log(
          `Retry ${attempt}/${maxRetries} failed, waiting ${delayMs}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    throw new Error(
      `Condition not met after ${maxRetries} retries for SBI ${sbi}. Last result: ${JSON.stringify(
        lastResult?.body,
        null,
        2
      )}`
    )
  }

  // Get initial record
  const { body: record } = await getGrantPaymentById(sbi)
  const recordData = Array.isArray(record.docs) ? record.docs[0] : record

  console.log(`Matched record:\n${JSON.stringify(recordData, null, 2)}`)

  expect(recordData).toBeDefined()
  expect(recordData.sbi).toBe(sbi)
  expect(recordData.grants).toHaveLength(1)

  const payments = recordData.grants[0].payments

  expect(payments).toHaveLength(4)

  payments.forEach((payment) => {
    expect(payment.status).toBe('pending')
  })

  // Process all payments for this SBI
  const { statusCode, body: processResult } = await processPaymentsBySbi(sbi)

  expect(statusCode).toBe(200)
  expect(processResult.result).toHaveLength(4)

  // Verify each processed payment
  payments.forEach((payment) => {
    const processedItem = processResult.result.find(
      (item) => item.body.correlationId === payment.correlationId
    )

    expect(processedItem).toBeDefined()
    expect(processedItem.body.sbi).toBe(sbi)
    expect(processedItem.body.correlationId).toBe(payment.correlationId)

    const expectedDueDate = new Date(payment.dueDate).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )

    expect(processedItem.body.dueDate).toBe(expectedDueDate)

    console.log(`Processed payment ${processedItem.body.invoiceNumber}`)

    expect(processedItem.body.invoiceLines).toBeDefined()
    expect(processedItem.body.invoiceLines.length).toBeGreaterThan(0)

    processedItem.body.invoiceLines.forEach((line) => {
      // schemeCode should have a value
      // expect(line.schemeCode).toBeDefined()
      // expect(line.schemeCode).not.toBe('')
      // expect(line.schemeCode).not.toBeNull()

      expect(line.accountCode).toBe('SOS710')
      expect(line.fundCode).toBe('DRD10')
    })
  })

  // Retry until all statuses are updated in DB
  const { body: updatedRecord } = await getGrantPaymentByIdWithRetry(sbi, {
    maxRetries: 10,
    delayMs: 2000,
    validate: (record) =>
      record?.grants?.[0]?.payments?.length === 4 &&
      record.grants[0].payments.every(
        (payment) => payment.status === 'submitted'
      )
  })

  const updatedData = Array.isArray(updatedRecord.docs)
    ? updatedRecord.docs[0]
    : updatedRecord

  const updatedPayments = updatedData.grants[0].payments

  expect(updatedPayments).toHaveLength(4)

  updatedPayments.forEach((payment, index) => {
    console.log(`Payment ${index + 1} status: ${payment.status}`)
    expect(payment.status).toBe('submitted')
  })
}
