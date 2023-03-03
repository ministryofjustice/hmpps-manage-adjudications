import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import DamagesOwedPage from './damagesOwedPage'

export default class DamagesOwedRoutes {
  page: DamagesOwedPage

  constructor(userService: UserService) {
    this.page = new DamagesOwedPage(userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
