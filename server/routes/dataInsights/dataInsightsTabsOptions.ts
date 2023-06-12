import adjudicationUrls from '../../utils/urlGenerator'

export const enum DataInsightsTab {
  TOTALS_ADJUDICATIONS_AND_LOCATIONS = 'totalsAdjudicationsAndLocations',
  PROTECTED_CHARACTERISTICS_AND_VULNERABILITIES = 'protectedCharacteristicsAndVulnerabilities',
  OFFENCE_TYPE = 'offenceType',
  PUNISHMENTS = 'punishments',
  PLEAS_AND_FINDINGS = 'pleasAndFindings',
}

export function getDataInsightsTabsOptions(activeTab: string) {
  return {
    title: 'Adjudication data',
    activeTab,
    items: [
      {
        text: 'Totals - adjudications and locations',
        attributes: {},
        active: activeTab === DataInsightsTab.TOTALS_ADJUDICATIONS_AND_LOCATIONS,
        href: adjudicationUrls.dataInsights.urls.totalsAdjudicationsAndLocations(),
      },
      {
        text: 'Protected characteristics and vulnerabilities',
        attributes: {},
        active: activeTab === DataInsightsTab.PROTECTED_CHARACTERISTICS_AND_VULNERABILITIES,
        href: adjudicationUrls.dataInsights.urls.protectedCharacteristicsAndVulnerabilities(),
      },
      {
        text: 'Offence type',
        attributes: {},
        active: activeTab === DataInsightsTab.OFFENCE_TYPE,
        href: adjudicationUrls.dataInsights.urls.offenceType(),
      },
      {
        text: 'Punishments',
        attributes: {},
        active: activeTab === DataInsightsTab.PUNISHMENTS,
        href: adjudicationUrls.dataInsights.urls.punishments(),
      },
      {
        text: 'Pleas and findings',
        attributes: {},
        active: activeTab === DataInsightsTab.PLEAS_AND_FINDINGS,
        href: adjudicationUrls.dataInsights.urls.pleasAndFindings(),
      },
    ],
  }
}
