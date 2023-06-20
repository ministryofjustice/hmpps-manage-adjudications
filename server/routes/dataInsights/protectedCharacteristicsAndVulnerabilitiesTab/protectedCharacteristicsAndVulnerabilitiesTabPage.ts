/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartService from '../../../services/chartService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class ProtectedCharacteristicsAndVulnerabilitiesTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartService: ChartService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartDetails: ChartDetailsResult = await this.chartService.getChart(username, agencyId, '1a')
    return res.render(`pages/dataInsights/protectedCharacteristicsAndVulnerabilitiesTab.njk`, {
      errors: error ? [error] : [],
      chartDetails,
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PROTECTED_CHARACTERISTICS_AND_VULNERABILITIES),
      chartSettingList: [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
