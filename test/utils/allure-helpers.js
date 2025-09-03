// Allure helper utilities for structured API logging
import allureReporter from '@wdio/allure-reporter'

function stringify(value) {
  try {
    if (typeof value === 'string') return value
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function addAllureAttachment(name, content, type = 'application/json') {
  const body = typeof content === 'string' ? content : stringify(content)
  allureReporter.addAttachment(name, body, type)
}

export function logApiStep({ title, request, response, validation }) {
  const stepTitle = title || `${request?.method || 'GET'} ${request?.url || ''}`
  allureReporter.addStep(stepTitle)
  if (request) {
    addAllureAttachment('API Request - URL', request.url, 'text/plain')
    if (request.headers)
      addAllureAttachment('API Request - Headers', request.headers)
    if (request.body !== undefined) {
      const type =
        typeof request.body === 'string' ? 'text/plain' : 'application/json'
      addAllureAttachment('API Request - Body', request.body, type)
    }
  }
  if (response) {
    addAllureAttachment(
      'API Response - Status',
      stringify({ status: response.status, ok: response.ok }),
      'application/json'
    )
    if (response.headers)
      addAllureAttachment('API Response - Headers', response.headers)
    if (response.body !== undefined) {
      // try to detect json
      const contentType = response.contentType || 'text/plain'
      addAllureAttachment(
        'API Response - Body',
        response.body,
        contentType.includes('json') ? 'application/json' : 'text/plain'
      )
    }
  }
  if (validation) {
    addAllureAttachment('Validation', validation, 'application/json')
  }
}
