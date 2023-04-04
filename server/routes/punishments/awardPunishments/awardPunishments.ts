/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { User } from '../../../data/hmppsAuthClient'
import PunishmentsService from '../../../services/punishmentsService'
import adjudicationUrls from '../../../utils/urlGenerator'

export enum PageRequestType {
  PUNISHMENTS_FROM_API,
  PUNISHMENTS_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_API
  }

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_SESSION
  }
}

export default class AwardPunishmentsPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly punishmentsService: PunishmentsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const punishmentToDelete = req.query.delete || null

    const redirectAfterRemoveUrl = `${adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber)}?delete=`

    const punishments = await this.getPunishments(req, adjudicationNumber, user)

    // // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData()) {
      // Set up session to allow for adding and deleting
      this.punishmentsService.setAllSessionPunishments(req, punishments, adjudicationNumber)
    }

    if (punishmentToDelete) {
      await this.punishmentsService.deleteSessionPunishments(req, punishmentToDelete as string, adjudicationNumber)
    }

    return res.render(`pages/awardPunishments.njk`, {
      cancelHref: adjudicationUrls.homepage.root,
      redirectAfterRemoveUrl,
      changeUrl: adjudicationUrls.punishment.urls.edit(adjudicationNumber),
      adjudicationNumber,
      punishments,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    // this is temporary
    return res.redirect(adjudicationUrls.homepage.root)
  }

  getPunishments = async (req: Request, adjudicationNumber: number, user: User) => {
    if (this.pageOptions.displaySessionData()) {
      return this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
    }

    return this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
    // return [
    //   {
    //     redisId: 'string1',
    //     type: 'EXCLUSION_WORK',
    //     schedule: {
    //       days: 2,
    //       startDate: '2023-04-03',
    //       endDate: '2023-04-05',
    //     },
    //   },
    //   {
    //     redisId: 'string2',
    //     type: 'EARNINGS',
    //     stoppagePercentage: 10,
    //     schedule: {
    //       days: 5,
    //       suspendedUntil: '2023-04-20',
    //     },
    //   },
    //   {
    //     redisId: 'string3',
    //     type: 'PRIVILEGE',
    //     privilegeType: 'CANTEEN',
    //     schedule: {
    //       days: 10,
    //       startDate: '2023-04-04',
    //       endDate: '2023-04-14',
    //     },
    //   },
    //   {
    //     redisId: 'string4',
    //     type: 'PRIVILEGE',
    //     privilegeType: 'OTHER',
    //     otherPrivilege: 'Sewing machine',
    //     schedule: {
    //       days: 20,
    //       startDate: '2023-04-03',
    //       endDate: '2023-04-23',
    //     },
    //   },
    // ]
  }
}
