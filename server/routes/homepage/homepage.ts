import { Request, Response } from 'express'
import moment from 'moment'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole, momentDateToDatePicker } from '../../utils/utils'

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

const createTasks = (): TaskType[] => {
  return [
    {
      id: 'start-a-new-report',
      heading: 'Start a new report',
      description: 'Start creating a new report.',
      href: adjudicationUrls.searchForPrisoner.root,
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
      heading: 'View your completed reports',
      description:
        'View your completed reports. You can also make changes to a report for up to 48 hours, unless the report has been accepted by the reviewer.',
      href: adjudicationUrls.yourCompletedReports.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'view-all-reports',
      heading: 'View all reports',
      href: adjudicationUrls.allCompletedReports.root,
      links: [
        {
          text: 'Review reports',
          href: adjudicationUrls.allCompletedReports.urls.filter({
            fromDate: momentDateToDatePicker(moment().subtract(7, 'days')),
            toDate: momentDateToDatePicker(moment()),
            status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          }),
          id: 'review-reports',
        },
      ],
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
    },
    {
      id: 'view-scheduled-hearings',
      heading: 'View all hearings',
      href: adjudicationUrls.viewScheduledHearings.root,
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
      links: [
        {
          text: 'Schedule hearings',
          href: adjudicationUrls.allCompletedReports.urls.filter({
            fromDate: momentDateToDatePicker(moment().subtract(7, 'days')),
            toDate: momentDateToDatePicker(moment()),
            status: ReportedAdjudicationStatus.UNSCHEDULED,
          }),
          id: 'schedule-hearings',
        },
      ],
    },
    {
      id: 'enter-outcomes',
      heading: 'Enter outcomes',
      href: adjudicationUrls.viewScheduledHearings.root,
      roles: ['ADJUDICATIONS_REVIEWER'],
      enabled: true,
    },
    {
      id: 'print-completed-dis-forms',
      heading: 'Print completed DIS 1/2 forms',
      description: '',
      href: adjudicationUrls.printCompletedDisForms.root,
      roles: [],
      enabled: true,
    },
    {
      id: 'confirm-dis-has-been-issued',
      heading: 'Confirm DIS 1/2 has been issued to the prisoner',
      description: '',
      href: adjudicationUrls.confirmDISFormsIssued.root,
      roles: [],
      enabled: true,
    },
  ]
}

export default class HomepageRoutes {
  constructor(private readonly userService: UserService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    const enabledTasks = createTasks().filter(task => task.enabled)
    const reviewerTasks = enabledTasks.filter(task => task.roles.includes('ADJUDICATIONS_REVIEWER'))
    const reporterTasks = enabledTasks.filter(
      task => !task.roles.includes('ADJUDICATIONS_REVIEWER') && !task.heading.includes('DIS')
    )
    const disRelatedTasks = createTasks().filter(task => task.heading.includes('DIS'))

    return res.render('pages/homepage', {
      reviewerTasks: reviewerTasks.filter(task => hasAnyRole(task.roles, userRoles)),
      reporterTasks,
      disRelatedTasks,
    })
  }
}
