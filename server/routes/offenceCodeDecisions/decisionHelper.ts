/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { User } from '../../data/hmppsManageUsersClient'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import Question from '../../offenceCodeDecisions/Question'

export type WitnessData = {
  firstName?: string
  lastName?: string
}

export default class DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {}

  decision(key: string): Question {
    return this.decisionTreeService.getDecisionTree(key)
  }

  viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    return new Promise(resolve => {
      resolve({})
    })
  }

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

  getRedirectUrlForUserSearch(form: DecisionForm): {
    pathname: string
    query: { [key: string]: string }
  } {
    return null
  }

  formAfterSearch(selectedAnswerId: string, selectedUser: string): DecisionForm {
    return null
  }

  updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      victimOtherPersonsName: currentAnswers?.victimOtherPersonsName,
      victimPrisonersNumber: currentAnswers?.victimPrisonersNumber,
      victimStaffUsername: currentAnswers?.victimStaffUsername,
      offenceCode: `${this.decision(null).findAnswerById(form.selectedAnswerId).getOffenceCode()}`,
    }
  }

  witnessNamesForSession(form: DecisionForm, user: User): Promise<WitnessData> {
    return new Promise(resolve => {
      resolve({})
    })
  }
}
