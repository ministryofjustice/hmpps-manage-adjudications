import { Request, Response } from 'express'
import moment from 'moment'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole, momentDateToDatePicker } from '../../utils/utils'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

type TaskType = {
  id: string
  heading: string
  href: string
  description?: string
  links?: taskLinks[]
  roles: Array<string>
  enabled: boolean
}

type taskLinks = {
  text: string
  href: string
  id: string
}

const createTasks = (reviewTotal: number, transferReviewTotal: number, activeCaseloadName: string): TaskType[] => {
  return [
    {
      id: 'start-a-new-report',
      heading: 'Start a new report',
      description: 'Start creating a new report.',
      href: adjudicationUrls.isPrisonerStillInEstablishment.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'continue-a-report',
      heading: 'Continue a report',
      description: 'Continue a report that you have already started.',
      href: adjudicationUrls.continueReport.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'view-your-completed-reports',
      heading: 'Your completed reports',
      description:
        'View your completed reports. You can also make changes to a report for up to 48 hours, unless the report has been accepted by the reviewer.',
      href: adjudicationUrls.yourCompletedReports.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'view-all-reports',
      heading: `Reports from ${activeCaseloadName}`,
      href: adjudicationUrls.allCompletedReports.root,
      links: [
        {
          text: `Awaiting review (${reviewTotal})`,
          href: adjudicationUrls.allCompletedReports.urls.filter({
            fromDate: momentDateToDatePicker(moment().subtract(7, 'days')),
            toDate: momentDateToDatePicker(moment()),
            status: ReportedAdjudicationStatus.AWAITING_REVIEW,
            transfersOnly: false,
          }),
          id: 'review-reports',
        },
      ],
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
    },
    {
      id: 'transfers',
      heading: `Reports from transfers in (${transferReviewTotal})`,
      href: adjudicationUrls.allTransferredReports.urls.filter({
        status: [
          ReportedAdjudicationStatus.UNSCHEDULED,
          ReportedAdjudicationStatus.REFER_POLICE,
          ReportedAdjudicationStatus.ADJOURNED,
          ReportedAdjudicationStatus.REFER_INAD,
        ],
        transfersOnly: true,
      }),
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
    },
    {
      id: 'hearings-and-enter-outcomes',
      heading: 'Manage hearings and enter outcomes',
      href: adjudicationUrls.viewScheduledHearings.root,
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
      links: [
        {
          text: 'Schedule hearings',
          href: adjudicationUrls.allCompletedReports.urls.filter({
            fromDate: momentDateToDatePicker(moment().subtract(7, 'days')),
            toDate: momentDateToDatePicker(moment()),
            status: [
              ReportedAdjudicationStatus.UNSCHEDULED,
              ReportedAdjudicationStatus.ADJOURNED,
              ReportedAdjudicationStatus.REFER_INAD,
            ],
            transfersOnly: false,
          }),
          id: 'schedule-hearings',
        },
      ],
    },
    {
      id: 'print-completed-dis-forms',
      heading: 'Print notice of being placed on report',
      description:
        'Print the notice of being placed on report and adjudications process guidance (DIS 1 and 2) for a prisoner.',
      href: adjudicationUrls.printCompletedDisForms.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'confirm-dis-has-been-issued',
      heading: 'Confirm notice of being placed on report was issued',
      description: 'Enter when a prisoner was given the notice of being placed on report (DIS 1).',
      href: adjudicationUrls.confirmDISFormsIssued.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'awarded-punishments-and-damages',
      heading: 'Awarded punishments and damages',
      description: '',
      href: adjudicationUrls.awardedPunishmentsAndDamages.root,
      roles: [],
      enabled: true,
    },
  ]
}

export default class HomepageRoutes {
  constructor(
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const [userRoles, counts] = await Promise.all([
      this.userService.getUserRoles(user.token),
      this.reportedAdjudicationsService.getAgencyReportCounts(user),
    ])
    const { reviewTotal, transferReviewTotal } = counts
    const userCaseloadName = user.meta?.description || null
    const enabledTasks = createTasks(reviewTotal, transferReviewTotal, userCaseloadName).filter(task => task.enabled)
    const reviewerTasks = enabledTasks.filter(task => task.roles.includes('ADJUDICATIONS_REVIEWER'))

    const disRelatedTasksPredicate = (task: TaskType) =>
      task.description?.includes('DIS') || task.heading.includes('Awarded punishments and damages')
    const reporterTasks = enabledTasks.filter(
      task => !task.roles.includes('ADJUDICATIONS_REVIEWER') && !disRelatedTasksPredicate(task)
    )
    const disRelatedTasks = createTasks(reviewTotal, transferReviewTotal, userCaseloadName).filter(
      disRelatedTasksPredicate
    )

    const dataInsightsTask = {
      id: 'data-insights',
      heading: 'Adjudications data',
      description:
        'Charts and data for adjudications in this establishment, including by location and different prisoner characteristics.',
      href: adjudicationUrls.dataInsights.root,
      enabled: true,
    }

    return res.render('pages/homepage', {
      reviewerTasks: reviewerTasks.filter(task => hasAnyRole(task.roles, userRoles)),
      reporterTasks,
      disRelatedTasks,
      dataInsightsTask,
    })
  }
}
