/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { flattenPunishments } from '../../../data/PunishmentResult'
import { formatTimestampTo, getFormattedOfficerName } from '../../../utils/utils'
import UserService from '../../../services/userService'
import logger from "../../../../logger";

export enum PageRequestType {
  REPORTER,
  REVIEWER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReporter(): boolean {
    return this.pageType === PageRequestType.REPORTER
  }
}

const getVariablesForPageType = (pageOptions: PageOptions, reportedAdjudication: ReportedAdjudication) => {
  if (pageOptions.isReporter()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.adjudicationNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.adjudicationNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.adjudicationNumber),
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.adjudicationNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.adjudicationNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.adjudicationNumber),
  }
}

export default class PunishmentsTabPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )

    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )
    const readOnly = this.pageOptions.isReporter() || reportedAdjudication.outcomeEnteredInNomis

    const finalOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
      adjudicationNumber,
      [ReportedAdjudicationStatus.CHARGE_PROVED, ReportedAdjudicationStatus.QUASHED],
      user
    )
    const amount = finalOutcomeItem.outcome?.outcome?.amount || false
    const caution = finalOutcomeItem.outcome?.outcome?.caution || false

    const punishments = flattenPunishments(
      await this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
    )
    /*
    const names: Map<string, string> = new Map<string, string>()
    const punishmentComments = await Promise.all(
      reportedAdjudication.punishmentComments.map(async punishmentComment => {
        const { dateTime } = punishmentComment
        const date = formatTimestampTo(dateTime, 'D MMMM YYYY')
        const time = formatTimestampTo(dateTime, 'HH:mm')

        const userId = punishmentComment.createdByUserId
        let name
        if (names.has(userId)) {
          name = names.get(userId)
        } else {
          const creator = await this.userService.getStaffNameFromUsername(userId, user)
          name = getFormattedOfficerName(creator.name)
          logger.info(`    name!!! ${name}`)
          names.set(userId, name)
        }

        return {
          id: punishmentComment.id,
          comment: punishmentComment.comment,
          date,
          time,
          name,
        }
      })
    )
    */

    const usernames = new Set(reportedAdjudication.punishmentComments.map(it => it.createdByUserId))
    const users = await Promise.all(
      Array.from(usernames).map(async username => this.userService.getStaffNameFromUsername(username, user))
    )
    const names: { [key: string]: string } = Object.fromEntries(
      users.map(it => [it.username, getFormattedOfficerName(it.name)])
    )

    const punishmentComments = new Array<any>()
    // eslint-disable-next-line no-restricted-syntax
    for (const punishmentComment of reportedAdjudication.punishmentComments) {
      const { dateTime } = punishmentComment
      const date = formatTimestampTo(dateTime, 'D MMMM YYYY')
      const time = formatTimestampTo(dateTime, 'HH:mm')

      const userId = punishmentComment.createdByUserId
      const name = names[userId]
      const comment = {
        id: punishmentComment.id,
        comment: punishmentComment.comment,
        date,
        time,
        name,
      }
      punishmentComments.push(comment)
    }

    return res.render(`pages/adjudicationForReport/punishmentsTab.njk`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudication.status,
      readOnly,
      chargeProved: reportedAdjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED,
      quashed: reportedAdjudication.status === ReportedAdjudicationStatus.QUASHED,
      moneyRecoveredBoolean: !!amount,
      moneyRecoveredAmount: amount && amount.toFixed(2),
      caution,
      moneyChangeLinkHref: adjudicationUrls.moneyRecoveredForDamages.urls.edit(adjudicationNumber),
      cautionChangeLinkHref: adjudicationUrls.isThisACaution.urls.edit(adjudicationNumber),
      punishments,
      punishmentComments,
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }
}
