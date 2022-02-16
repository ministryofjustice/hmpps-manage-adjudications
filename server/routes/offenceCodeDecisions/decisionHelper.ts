import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import { DecisionAnswers } from './decisionAnswers'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'

export default class DecisionHelper {
  private decision = decisionTree

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

  updatedAnswers(currentAnswers: DecisionAnswers, form: DecisionForm): DecisionAnswers {
    return {
      victimOtherPerson: currentAnswers?.victimOtherPerson,
      victimOfficer: currentAnswers?.victimOfficer,
      victimPrisoner: currentAnswers?.victimPrisoner,
      victimStaff: currentAnswers?.victimStaff,
      offenceCode: this.decision.findById(form.selectedDecisionId).getOffenceCode(),
    }
  }
}
