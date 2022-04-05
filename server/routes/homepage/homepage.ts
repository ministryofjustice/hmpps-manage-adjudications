import { Request, Response } from 'express'
import UserService from '../../services/userService'
import { searchForPrisoner } from '../../utils/urlGenerator'
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
    href: searchForPrisoner.root,
    roles: null,
    enabled: true,
  },
  {
    id: 'continue-a-report',
    heading: 'Continue a report',
    description: 'Continue a report that you have already started.',
    href: '/select-report',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-your-completed-reports',
    heading: 'View your completed reports',
    description:
      'View your completed reports. You can also make changes to a report you have completed in the last 48 hours.',
    href: '/your-completed-reports',
    roles: null,
    enabled: true,
  },
  {
    id: 'view-all-completed-reports',
    heading: 'View all completed reports',
    description: 'View all completed reports in your establishment.',
    href: '/all-completed-reports',
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
