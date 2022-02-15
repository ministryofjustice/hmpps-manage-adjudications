import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import { DecisionAnswers } from './decisionAnswers'

export default class DecisionHelper {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    return new Promise(resolve => {
      resolve({})
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateForm(form: DecisionForm, req: Request): FormError[] {
    return []
  }

  formFromPost(req: Request): DecisionForm {
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
  updatedForm(form: DecisionForm, redirectData: string): DecisionForm {
    return form
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatedAnswers(answers: DecisionAnswers, form: DecisionForm): DecisionAnswers {
    return answers
  }
}
