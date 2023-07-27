import { Request, Response } from 'express'
import adjudicationUrls from '../../utils/urlGenerator'
import config from '../../config'

export const enum DataInsightsTab {
  TOTALS_ADJUDICATIONS_AND_LOCATIONS = 'totalsAdjudicationsAndLocations',
  PROTECTED_AND_RESPONSIVITY_CHARACTERISTICS = 'protectedAndResponsivityCharacteristics',
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
        text: 'Protected and responsivity characteristics',
        attributes: {},
        active: activeTab === DataInsightsTab.PROTECTED_AND_RESPONSIVITY_CHARACTERISTICS,
        href: adjudicationUrls.dataInsights.urls.protectedAndResponsivityCharacteristics(),
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

export const checkDataInsightsPermissions = (
  req: Request,
  res: Response,
  pageViewCallBack: (req: Request, res: Response) => void
) => {
  const activeCaseLoadId = getActiveCaseLoadId(res)
  if (config.dataInsightsFlag === 'true' && ['RNI'].includes(activeCaseLoadId)) {
    return pageViewCallBack(req, res)
  }
  return res.redirect(adjudicationUrls.homepage.root)
}

export const getActiveCaseLoadId = (res: Response) => res.locals.user.activeCaseLoadId
