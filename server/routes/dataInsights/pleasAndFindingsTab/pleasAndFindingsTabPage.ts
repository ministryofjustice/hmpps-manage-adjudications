/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class PleasAndFindingsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartApiService: ChartApiService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartDetails: ChartDetailsResult = await this.chartApiService.getChart(username, agencyId, '1a')
    return res.render(`pages/dataInsights/pleasAndFindingsTab.njk`, {
      errors: error ? [error] : [],
      chartDetails,
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PLEAS_AND_FINDINGS),
      chartSettingMap: {},
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
