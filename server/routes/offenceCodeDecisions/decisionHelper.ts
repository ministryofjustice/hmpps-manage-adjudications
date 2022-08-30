import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import Question from '../../offenceCodeDecisions/Question'
import { WitnessData } from '../witnesses/witnessData'

export default class DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {}

  decision(): Question {
    return this.decisionTreeService.getDecisionTree()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    return new Promise(resolve => {
      resolve({})
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateForm(form: DecisionForm, req: Request, user: User): Promise<FormError[]> {
    return new Promise(resolve => {
      resolve([])
    })
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
      victimOtherPersonsName: currentAnswers?.victimOtherPersonsName,
      victimPrisonersNumber: currentAnswers?.victimPrisonersNumber,
      victimStaffUsername: currentAnswers?.victimStaffUsername,
      offenceCode: `${this.decision().findAnswerById(form.selectedAnswerId).getOffenceCode()}`,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  witnessNamesForSession(form: DecisionForm, user: User): Promise<WitnessData> {
    return new Promise(resolve => {
      resolve({})
    })
  }
}
