import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'

export default class DecisionHelper {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewDataFromDecisionForm(decisionForm: DecisionForm, user: User): Promise<unknown> {
    return new Promise(resolve => {
      resolve({})
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateDecisionForm(decisionForm: DecisionForm, req: Request): FormError[] {
    return []
  }

  decisionFormFromPost(req: Request): DecisionForm {
    const { selectedDecisionId } = req.body
    return {
      selectedDecisionId,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRedirectUrlForUserSearch(form: DecisionForm): {
    pathname: string
    query: { [key: string]: string }
  } {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatedDecisionForm(decisionForm: DecisionForm, redirectData: string): DecisionForm {
    return decisionForm
  }
}
