import { Request, Response } from 'express'

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
    id: 'search-restricted-patient',
    heading: 'Search for a restricted patient',
    description: 'Search for a restricted patient to view their details or add a case note.',
    href: '/search-for-restricted-patient',
    roles: null,
    enabled: true,
  },
]

export default class PrisonerSearchRoutes {
  view = async (req: Request, res: Response): Promise<void> =>
    res.render('pages/homepage', {
      tasks,
    })
}
