import nunjucks from 'nunjucks'
import path from 'path'
import express from 'express'
import { AdjudicationResultReportDataBlank } from './adjudicationResultReportDataBlank'
import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { PrivilegeType, PunishmentType } from './PunishmentResult'
import nunjucksSetup from '../utils/nunjucksSetup'

describe('blank DIS7 loss of privileges', () => {
  it.each([
    { isYouthOffender: false, maxDays: 84 },
    { isYouthOffender: true, maxDays: 21 },
  ])('renders privileges for isYOI=$isYouthOffender', ({ isYouthOffender, maxDays }) => {
    const report = new AdjudicationResultReportDataBlank(
      '123',
      {
        isYouthOffender,
        prisonerFirstName: 'Alex',
        prisonerLastName: 'Smith',
        prisonerAgencyName: 'Prison',
        createdDateTime: '2024-01-01T12:00:00',
      } as ConfirmedOnReportData,
      '01/01/1990',
      { years: 34, months: 0 },
    )
    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(process.cwd(), 'server/views')))
    const html = env.renderString(
      `{% from "macros/adjudicationResultReportDetailsBlank_v2.njk" import adjudicationResultReportDetailsBlank_v2 %}
       {{ adjudicationResultReportDetailsBlank_v2(report) }}`,
      { report },
    )

    const gymRows = [
      ...html.matchAll(
        /<div class='adjudication-pdf-section-(suspended-)?punishment-details'>\s*<div[^>]*>\s*<p[^>]*>Gym<\/p>([\s\S]*?)\n\s{4}<\/div>/g,
      ),
    ]
    expect(gymRows).toHaveLength(2)
    expect(gymRows.map(row => row[1] || '')).toEqual(['', 'suspended-'])
    for (const [index, row] of gymRows.entries()) {
      expect(row[0]).toContain(`${maxDays} days`)
      expect(row[0].match(/<input\b/g)).toHaveLength(index === 0 ? 4 : 6)
      const sectionStart = html.lastIndexOf('Loss of privileges', row.index)
      const association = html.lastIndexOf('Association', row.index)
      expect(sectionStart).toBeGreaterThanOrEqual(0)
      expect(association).toBeGreaterThan(sectionStart)
      expect(association).toBeLessThan(row.index!)
      expect(html.indexOf('Specify any other privileges withdrawn', row.index)).toBeGreaterThan(row.index!)
    }

    const sections = html.split('Specify any other privileges withdrawn')
    expect(sections).toHaveLength(3)
    for (const [index, section] of sections.slice(1).entries()) {
      const rows = [
        ...section.matchAll(
          /<div class='adjudication-pdf-section-(suspended-)?punishment-details'>\s*<div[^>]*>\s*<p[^>]*><\/p>\s*<\/div>\s*<div[^>]*>\s*<p[^>]*>(.*?)<\/p>([\s\S]*?)\n\s{4}<\/div>/g,
        ),
      ].slice(0, 2)
      expect(rows).toHaveLength(2)
      for (const row of rows) {
        expect(row[1] || '').toBe(index === 0 ? '' : 'suspended-')
        expect(row[2].trim()).toBe(`${maxDays} days`)
        expect(row[0].match(/<input\b/g)).toHaveLength(index === 0 ? 4 : 6)
      }
    }

    expect(html).toMatch(
      /<div class='break-inside-avoid'>\s*<div class='adjudication-pdf-section-punishment-details'>[\s\S]*?<strong>Stoppage of earnings<\/strong>[\s\S]*?<p[^>]*>Percentage<\/p>[\s\S]*?\n\s{4}<\/div>\s*<\/div>/,
    )

    const visitGroups = [
      ...html.matchAll(
        /<div class='break-inside-avoid'>\s*<div class='adjudication-pdf-section-(?:suspended-)?punishment-details'>([\s\S]*?)\n\s{4}<\/div>\s*<div class='adjudication-pdf-section-(?:suspended-)?punishment-details'>([\s\S]*?)\n\s{4}<\/div>\s*<\/div>/g,
      ),
    ].filter(
      group =>
        /(?:Loss|Restriction) of social visits/.test(group[1]) || group[2].includes('Prisoner has a child under 18'),
    )
    expect(visitGroups).toHaveLength(isYouthOffender ? 0 : 4)
    for (const group of visitGroups) {
      expect(group[1]).toMatch(/(?:Loss|Restriction) of social visits/)
      expect(group[2]).toContain('Prisoner has a child under 18')
    }

    expect(html).toMatch(
      /<div class='break-inside-avoid'>\s*<div class='adjudication-pdf-section-signature-details'>[\s\S]*?Signature of adjudicator[\s\S]*?Date \(DD\/MM\/YYYY\)[\s\S]*?\n<\/div>\n<\/div>/,
    )
    expect(html).toMatch(
      /<div class='break-inside-avoid'>\s*<p[^>]*>\s*A record of the finding[\s\S]*?Signature of officer[\s\S]*?Date \(DD\/MM\/YYYY\)[\s\S]*?\n<\/div>\n<\/div>/,
    )
  })
})

describe('completed DIS7 loss of Gym privilege', () => {
  it('shows Gym and its explanation for both active and suspended punishments', () => {
    nunjucksSetup(express())
    const punishment = {
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.GYM,
      schedule: { duration: 3, suspendedUntil: '2026-12-01' },
    }
    const html = nunjucks.renderString(
      `{% from "macros/adjudicationResult_DIS7/punishments.njk" import punishments %}
       {% from "macros/adjudicationResult_DIS7/suspendedPunishments.njk" import suspendedPunishments %}
       {{ punishments(data) }} {{ suspendedPunishments(data) }}`,
      { data: { punishments: [punishment], suspendedPunishments: [punishment] } },
    )

    expect(html).toContain('Loss of gym - 3 days')
    expect(html).toContain('Suspended: Loss of gym - 3 days')
    expect(html).toContain('You have lost the extra gym access')
    expect(html).toContain('You would lose the extra gym access')
  })
})
