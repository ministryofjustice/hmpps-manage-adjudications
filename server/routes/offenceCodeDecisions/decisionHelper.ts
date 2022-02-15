import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'

export default abstract class DecisionHelper {
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

  abstract validateDecisionForm(decisionForm: DecisionForm, searching: boolean): FormError[]

  abstract decisionFormFromPost(decisionForm: DecisionForm, req: Request): DecisionForm

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
