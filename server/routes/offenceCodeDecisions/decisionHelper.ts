import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'

export default class DecisionHelper {
  viewDataFromDecisionForm(
    decisionForm: DecisionForm,
    user: User,
    userService: UserService,
    placeOnReportService: PlaceOnReportService
  ): Promise<any> {
    return new Promise(resolve => {
      resolve({})
    })
  }

  validateDecisionForm(decisionForm: DecisionForm, req: Request): FormError[] {
    return []
  }

  decisionFormFromPost(req: Request): DecisionForm {
    const { selectedDecisionId } = req.body
    return {
      selectedDecisionId,
    }
  }

  getRedirectUrlForUserSearch(form: DecisionForm): {
    pathname: string
    query: { [key: string]: string }
  } {
    return null
  }

  updatedDecisionForm(decisionForm: DecisionForm, redirectData: string): DecisionForm {
    return decisionForm
  }

  async getPrisonerDetails(prisonerNumber: string, user: User, placeOnReportService: PlaceOnReportService) {
    if (prisonerNumber) {
      return placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    }
    return null
  }
}
