import { Request, Response } from 'express'
import { FormError } from '../../@types/template'

type PageData = {
  error?: FormError
  searchTermId?: string
  searchTermValue?: string
}

export default class AssaultRoutes {
  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, searchTermId, searchTermValue } = pageData
    const { prisonerNumber, id } = req.params

    return res.render(`pages/assault`, {
      errors: error ? [error] : [],
      searchTermId,
      searchTermValue,
      exitUrl: `/place-the-prisoner-on-report/${prisonerNumber}/${id}`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    // const { prisonerNumber, id } = req.params
    // const { user } = res.locals
    const { assaultedPrisonerId, assaultedPrisonOfficerId, assaultedOtherStaff, assaultedOtherMisc } = req.body

    return this.renderView(req, res, {
      searchTermId: '',
      searchTermValue: '',
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { id, prisonerNumber } = req.params
    const { assaultedPrisonerId, assaultedPrisonOfficerId, assaultedOtherStaff, assaultedOtherMisc } = req.body
    console.log(req.body.search)
    if (req.body.search) {
      // redirect to prisoner search page or staff search page with details entered
      const searchPageHref =
        req.body.search === 'assaultedPrisonerSearchSubmit'
          ? `/select-associated-prisoner?searchTerm=${assaultedPrisonerId}`
          : `/select-associated-staff?searchTerm=${assaultedPrisonOfficerId}`
      res.redirect(`${searchPageHref}&redirectUrl=/assault`)
    } else {
      // do overall form submit with data collected
    }
  }
}
