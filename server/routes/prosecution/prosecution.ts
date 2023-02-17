import { Request, Response } from 'express'
import UserService from '../../services/userService'
import ProsecutionPage from './prosecutionPage'

export default class ProsecutionRoutes {
  page: ProsecutionPage

  constructor(userService: UserService) {
    this.page = new ProsecutionPage(userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
