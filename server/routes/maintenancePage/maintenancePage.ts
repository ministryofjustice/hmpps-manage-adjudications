import { Request, Response } from 'express'

export default class MaintenanceRoutes {
  view = async (req: Request, res: Response): Promise<void> => {
    return res.render('pages/maintenancePage')
  }
}
