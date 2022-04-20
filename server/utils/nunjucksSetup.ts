/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import escapeHtml from 'escape-html'
import config from '../config'
import { FormError } from '../@types/template'
import { possessive } from './utils'
import adjudicationUrls from './urlGenerator'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Hmpps Manage Adjudications'

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId.trim())

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('findError', (formFieldId: string, array: FormError[] = []) => {
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('findErrors', (errors: FormError[], formFieldIds: string[]) => {
    const fieldIds = formFieldIds.map(field => `#${field}`)
    const errorIds = errors.map(error => error.href)
    const firstPresentFieldError = fieldIds.find(fieldId => errorIds.includes(fieldId))
    if (firstPresentFieldError) {
      return { text: errors.find(error => error.href === firstPresentFieldError).text }
    }
    return null
  })

  njkEnv.addFilter('toSelect', (array, valueKey, textKey, value, emptyOptionText) => {
    const emptyOption = {
      value: '',
      text: emptyOptionText || 'Select',
      selected: value === '',
    }
    const items = array.map((item: Record<string, unknown>) => ({
      value: item[valueKey],
      text: item[textKey],
      selected: `${item[valueKey]}` === `${value}`,
    }))
    return [emptyOption, ...items]
  })

  njkEnv.addFilter('concatErrors', (errors: FormError[], formFieldIds: string[]) => {
    const fieldIds = formFieldIds.map(field => `#${field}`)
    const foundErrors = errors.filter(error => fieldIds.includes(error.href))
    if (foundErrors.length === 0) {
      return null
    }
    const errorMessages = foundErrors.map(error => escapeHtml(error.text)).join('<br/>')
    return { html: errorMessages }
  })

  njkEnv.addFilter('isErrorPresent', (errors: FormError[], formFieldIds: string[]) => {
    const fieldIds = formFieldIds.map(field => `#${field}`)
    const foundErrors = errors.filter(error => fieldIds.includes(error.href))
    return foundErrors.length !== 0
  })

  njkEnv.addFilter('showDefault', (value, specifiedText) => {
    if (value === 0) return value

    return value || specifiedText || '--'
  })

  njkEnv.addFilter('formatStatement', (statement: string, cssClasses: string) => {
    if (!statement) return null
    const statementArray = statement.split(/\r|\n/)

    return statementArray
      .map(para => escapeHtml(para))
      .map(paragraph => {
        return `<p class=${cssClasses}>${paragraph}</p>`
      })
      .join('')
  })

  njkEnv.addGlobal('authUrl', config.apis.hmppsAuth.url)
  njkEnv.addGlobal('digitalPrisonServiceUrl', config.digitalPrisonServiceUrl)
  njkEnv.addGlobal('supportUrl', config.supportUrl)
  njkEnv.addFilter('possessive', possessive)
  njkEnv.addGlobal('adjudicationUrls', adjudicationUrls)
}
