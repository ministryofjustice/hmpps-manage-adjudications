import { Request, Response } from 'express'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'

type TaskType = {
  id: string
  heading: string
  href: string
  description: string
  roles: Array<string> | null
  enabled: boolean
}

export const tasks: TaskType[] = [
  {
    id: 'start-a-new-report',
    heading: 'Start a new report',
    description: 'Start creating a new report.',
    href: adjudicationUrls.searchForPrisoner.root,
    roles: null,
    enabled: true,
  },
  {
    id: 'continue-a-report',
    heading: 'Continue a report',
    description: 'Continue a report that you have already started.',
    href: adjudicationUrls.selectReport.root,
    roles: null,
    enabled: true,
  },
  {
    id: 'view-your-completed-reports',
    heading: 'View your completed reports',
    description:
      'View your completed reports. You can also make changes to a report for up to 48 hours, unless the report has been accepted by the reviewer.',
    href: adjudicationUrls.yourCompletedReports.root,
    roles: null,
    enabled: true,
  },
  {
    id: 'view-all-completed-reports',
    heading: 'View all completed reports',
    description: 'View all completed reports in your establishment.',
    href: adjudicationUrls.allCompletedReports.root,
    roles: ['ADJUDICATIONS_REVIEWER'],
    enabled: true,
  },
]

export default class HomepageRoutes {
  constructor(private readonly userService: UserService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    return res.render('pages/homepage', {
      tasks: tasks.filter(task => task.enabled).filter(task => hasAnyRole(task.roles, userRoles)),
    })
  }
}
