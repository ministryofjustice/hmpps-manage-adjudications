/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import escapeHtml from 'escape-html'
import config from '../config'
import { FormError } from '../@types/template'
import { possessive, getFormattedOfficerName, formatTimestampTo, convertOicHearingType } from './utils'
import adjudicationUrls from './urlGenerator'
import { DamageCode, EvidenceCode, WitnessCode } from '../data/DraftAdjudicationResult'
import {
  IssueStatus,
  OicHearingType,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../data/ReportedAdjudicationResult'
import { PrintDISFormsUiFilter } from './adjudicationFilterHelper'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  HearingOutcomeAdjournReason,
  OutcomeCode,
  ReferralOutcomeCode,
  convertHearingOutcomeAdjournReason,
  convertHearingOutcomePlea,
  convertHearingOutcomeFinding,
  NotProceedReason,
  NextStep,
  QuashGuiltyFindingReason,
} from '../data/HearingAndOutcomeResult'
import { convertPunishmentType, PunishmentReasonForChange } from '../data/PunishmentResult'
import { ApplicationInfo } from '../applicationInfo'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Hmpps Manage Adjudications'

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
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
    return getFormattedOfficerName(fullName)
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

  njkEnv.addFilter('toSelect', (array, valueKey, textKey, value, emptyOptionText, alternativeTextKey) => {
    const emptyOption = {
      value: '',
      text: emptyOptionText || 'Select',
      selected: value === '',
    }
    const items = array.map((item: Record<string, unknown>) => ({
      value: item[valueKey],
      text: item[textKey] || item[alternativeTextKey],
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

  njkEnv.addFilter('prisonRule', (isYouthOffender: boolean) => {
    if (isYouthOffender) {
      return 'Prison rule 55'
    }
    return 'Prison rule 51'
  })

  njkEnv.addFilter('damageCode', (damageCode: DamageCode) => {
    switch (damageCode) {
      case DamageCode.ELECTRICAL_REPAIR:
        return 'Electrical'
      case DamageCode.PLUMBING_REPAIR:
        return 'Plumbing'
      case DamageCode.FURNITURE_OR_FABRIC_REPAIR:
        return 'Furniture or fabric'
      case DamageCode.LOCK_REPAIR:
        return 'Lock'
      case DamageCode.REDECORATION:
        return 'Redecoration'
      case DamageCode.CLEANING:
        return 'Cleaning'
      case DamageCode.REPLACE_AN_ITEM:
        return 'Replacing an item'
      default:
        return null
    }
  })

  njkEnv.addFilter('evidenceCode', (evidenceCode: EvidenceCode, baggedEvidenceTagNumber) => {
    switch (evidenceCode) {
      case EvidenceCode.PHOTO:
        return 'Photo'
      case EvidenceCode.BODY_WORN_CAMERA:
        return 'Body-worn camera'
      case EvidenceCode.CCTV:
        return 'CCTV'
      case EvidenceCode.OTHER:
        return 'Other'
      case EvidenceCode.BAGGED_AND_TAGGED:
        return baggedEvidenceTagNumber
      default:
        return null
    }
  })

  njkEnv.addFilter('witnessCode', (witnessCode: WitnessCode) => {
    switch (witnessCode) {
      case WitnessCode.OFFICER:
        return 'Prison officer'
      case WitnessCode.STAFF:
        return "Member of staff who's not a prison officer"
      case WitnessCode.OTHER_PERSON:
        return 'None'
      default:
        return null
    }
  })

  njkEnv.addFilter('outcomeTableTitle', (outcomeCode: OutcomeCode) => {
    switch (outcomeCode) {
      case OutcomeCode.NOT_PROCEED:
        return 'Not proceeded with'
      case OutcomeCode.REFER_POLICE:
        return 'Police referral'
      case OutcomeCode.REFER_INAD:
        return 'Independent adjudicator referral'
      case OutcomeCode.REFER_GOV:
        return 'Governor referral'
      case OutcomeCode.QUASHED:
        return 'Guilty finding quashed'
      default:
        return null
    }
  })

  njkEnv.addFilter('convertNotProceedReason', (notProceedReason: NotProceedReason) => {
    switch (notProceedReason) {
      case NotProceedReason.ANOTHER_WAY:
        return 'Resolved in another way'
      case NotProceedReason.RELEASED:
        return 'Prisoner released'
      case NotProceedReason.UNFIT:
        return 'Prisoner mentally or physically unfit to attend'
      case NotProceedReason.FLAWED:
        return 'Flawed notice of report'
      case NotProceedReason.EXPIRED_NOTICE:
        return 'Notice of report issued more than 48 hours after incident'
      case NotProceedReason.EXPIRED_HEARING:
        return 'Hearing open outside timeframe'
      case NotProceedReason.NOT_FAIR:
        return 'Not fair to continue'
      case NotProceedReason.WITNESS_NOT_ATTEND:
        return 'Witness unable to attend'
      case NotProceedReason.OTHER:
        return 'Other'
      default:
        return 'Not known'
    }
  })

  njkEnv.addFilter('convertQuashReason', (quashReason: QuashGuiltyFindingReason) => {
    switch (quashReason) {
      case QuashGuiltyFindingReason.APPEAL_UPHELD:
        return 'Prisoner appeal upheld'
      case QuashGuiltyFindingReason.FLAWED_CASE:
        return 'Flawed case'
      case QuashGuiltyFindingReason.JUDICIAL_REVIEW:
        return 'Quashed on judicial review'
      case QuashGuiltyFindingReason.OTHER:
        return 'Other'
      default:
        return 'Not known'
    }
  })

  njkEnv.addFilter('convertReasonForChangingPunishments', (reasonForChange: PunishmentReasonForChange) => {
    switch (reasonForChange) {
      case PunishmentReasonForChange.OTHER:
        return 'Other'
      case PunishmentReasonForChange.APPEAL:
        return 'The punishments have been changed after an appeal'
      case PunishmentReasonForChange.CORRECTION:
        return 'To make a correction'
      case PunishmentReasonForChange.GOV_OR_DIRECTOR:
        return 'A Governor or Director has decided to terminate or change punishments for another reason'
      default:
        return 'Not known'
    }
  })

  njkEnv.addFilter('witnessName', (witnessLastName: string, witnessFirstName: string) => {
    if (!witnessLastName) return witnessFirstName
    return `${witnessLastName}, ${witnessFirstName}`
  })

  njkEnv.addFilter('toTextValue', (array, selected) => {
    if (!array) return null

    const items = array.map((entry: string) => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        hidden: true,
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter('issueStatus', (issueStatus: IssueStatus) => {
    if (issueStatus === IssueStatus.ISSUED) return 'Issued'
    return 'Not issued'
  })

  njkEnv.addFilter('issueStatusChecked', (key: IssueStatus, filter: PrintDISFormsUiFilter) => {
    if (!Array.isArray(filter.issueStatus)) return key === filter.issueStatus
    return filter.issueStatus.includes(key)
  })

  njkEnv.addFilter('statusNotAwaitingRejectedReturned', (reportStatus: ReportedAdjudicationStatus) => {
    if (
      reportStatus === ReportedAdjudicationStatus.AWAITING_REVIEW ||
      reportStatus === ReportedAdjudicationStatus.REJECTED ||
      reportStatus === ReportedAdjudicationStatus.RETURNED
    ) {
      return false
    }
    return true
  })

  njkEnv.addFilter('convertToWord', (number: number) => {
    switch (number) {
      case 1:
        return 'first'
      case 2:
        return 'second'
      case 3:
        return 'third'
      default:
        return null
    }
  })

  njkEnv.addFilter('truthy', data => Boolean(data))
  njkEnv.addGlobal('authUrl', config.apis.hmppsAuth.url)
  njkEnv.addGlobal('digitalPrisonServiceUrl', config.digitalPrisonServiceUrl)
  njkEnv.addGlobal('supportUrl', config.supportUrl)
  njkEnv.addGlobal('adjudicationUrls', adjudicationUrls)

  njkEnv.addFilter('possessive', possessive)
  njkEnv.addFilter('formatTimestampTo', formatTimestampTo)
  njkEnv.addFilter('convertOicHearingType', convertOicHearingType)
  njkEnv.addFilter('convertHearingOutcomeAdjournReason', convertHearingOutcomeAdjournReason)
  njkEnv.addFilter('convertHearingOutcomePlea', convertHearingOutcomePlea)
  njkEnv.addFilter('convertHearingOutcomeFinding', convertHearingOutcomeFinding)
  njkEnv.addFilter('reportedAdjudicationStatusDisplayName', reportedAdjudicationStatusDisplayName)
  njkEnv.addFilter('convertPunishmentType', convertPunishmentType)
  njkEnv.addGlobal('IssueStatus', IssueStatus)
  njkEnv.addGlobal('OicHearingType', OicHearingType)
  njkEnv.addGlobal('ReportedAdjudicationStatus', ReportedAdjudicationStatus)
  njkEnv.addGlobal('HearingOutcomeCode', HearingOutcomeCode)
  njkEnv.addGlobal('HearingOutcomePlea', HearingOutcomePlea)
  njkEnv.addGlobal('HearingOutcomeFinding', HearingOutcomeFinding)
  njkEnv.addGlobal('HearingOutcomeAdjournReason', HearingOutcomeAdjournReason)
  njkEnv.addGlobal('OutcomeCode', OutcomeCode)
  njkEnv.addGlobal('ReferralOutcomeCode', ReferralOutcomeCode)
  njkEnv.addGlobal('NextStep', NextStep)
  njkEnv.addGlobal('NotProceedReason', NotProceedReason)
  njkEnv.addGlobal('QuashGuiltyFindingReason', QuashGuiltyFindingReason)
  njkEnv.addGlobal('PunishmentReasonForChange', PunishmentReasonForChange)
}
