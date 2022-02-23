import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
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
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
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
  formAfterSearch(selectedAnswerId: string, selectedUser: string): DecisionForm {
    return null
  }

  updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      victimOtherPerson: currentAnswers?.victimOtherPerson,
      victimPrisoner: currentAnswers?.victimPrisoner,
      victimStaff: currentAnswers?.victimStaff,
      offenceCode: `${this.decision.findAnswerById(form.selectedAnswerId).getOffenceCode()}`,
    }
  }
}
