/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartService from '../../../services/chartService'
import { AgencyId, LocationId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class PleasAndFindingsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartService: ChartService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const agencyId: AgencyId = '123'
    const locationId: LocationId = 456
    const { user } = res.locals

    const chartDetails: ChartDetailsResult = await this.chartService.getChart(locationId, user, agencyId)
    return res.render(`pages/dataInsights/pleasAndFindingsTab.njk`, {
      errors: error ? [error] : [],
      chartDetails,
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PLEAS_AND_FINDINGS),
      chartSettingList: [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
