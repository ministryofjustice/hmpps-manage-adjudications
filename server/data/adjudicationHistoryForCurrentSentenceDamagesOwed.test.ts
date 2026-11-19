import nunjucks from 'nunjucks'
import express from 'express'
import AdjudicationHistoryForCurrentSentenceData from './adjudicationHistoryForCurrentSentenceData'
import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { Dis5AdjudicationsAndMoneyPrintSupport } from './manageAdjudicationsSystemTokensClient'
import { PrisonerSearchDetailsDis5 } from '../services/prisonerSearchService'
import { DamageObligation } from './prisonApiClient'
import nunjucksSetup from '../utils/nunjucksSetup'

const confirmedOnReportData = {
  prisonerFirstName: 'JOHN',
  prisonerLastName: 'SMITH',
  prisonerNumber: 'G6123VU',
  prisonerAgencyName: 'Moorland (HMP & YOI)',
  prisonerLivingUnitName: '5-2-A-050',
} as ConfirmedOnReportData

const damageObligation: DamageObligation = {
  id: 1,
  offenderNo: 'G6123VU',
  referenceNumber: 'MDI-000010',
  startDateTime: '2023-01-05T00:00:00',
  endDateTime: '2023-03-05T00:00:00',
  prisonId: 'MDI',
  amountToPay: 100,
  amountPaid: 20,
  status: 'ACTIVE',
  comment: 'Broken cell window',
  currency: 'GBP',
}

const renderDamagesOwed = (damageObligations: DamageObligation[], totalOwed: number) => {
  const dis5Data = {
    dateOfDiscovery: '2023-02-10',
    chargesWithSuspendedPunishments: [],
    existingPunishments: [],
    damageObligations,
    balances: { spends: 100, cash: 10, savings: 10, currency: 'GBP', damageObligations: totalOwed },
  } as unknown as Dis5AdjudicationsAndMoneyPrintSupport
  const data = new AdjudicationHistoryForCurrentSentenceData(
    'MDI-000060',
    confirmedOnReportData,
    dis5Data,
    {} as PrisonerSearchDetailsDis5,
  )
  return nunjucks.renderString(
    `{% from "macros/adjudicationHistoryForCurrentSentenceDamagesOwed.njk" import adjudicationHistoryForCurrentSentenceDamagesOwed %}
     {{ adjudicationHistoryForCurrentSentenceDamagesOwed(data) }}`,
    { data },
  )
}

describe('adjudication history for current sentence - money owed for damages', () => {
  beforeAll(() => {
    nunjucksSetup(express())
  })

  it('shows the total owed and a row for each active damage obligation', () => {
    const html = renderDamagesOwed([damageObligation], 80)

    expect(html).toContain('John Smith currently owes £80')
    expect(html).toContain('MDI-000010')
    expect(html).toContain('5 January 2023 to 5 March 2023')
    expect(html).toContain('£100')
    expect(html).toContain('£20')
    expect(html).not.toContain('does not owe any money for damages')
  })

  it('says nothing is owed when there are no active damage obligations', () => {
    const html = renderDamagesOwed([], 0)

    expect(html).toContain('John Smith does not owe any money for damages.')
    expect(html).not.toContain('currently owes')
  })
})
