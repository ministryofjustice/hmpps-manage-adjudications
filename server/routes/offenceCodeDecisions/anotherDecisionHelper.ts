// All functionality that knows about the prison decision.
import { Request } from 'express'
import { AnotherData, DecisionForm, OfficerData, PrisonerData } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { DecisionAnswers } from './decisionAnswers'

// eslint-disable-next-line no-shadow
enum ErrorType {
  ANOTHER_MISSING_NAME_INPUT = 'ANOTHER_MISSING_NAME_INPUT',
}
const error: { [key in ErrorType]: FormError } = {
  ANOTHER_MISSING_NAME_INPUT: {
    href: `#anotherNameInput`,
    text: 'You must enter a name',
  },
}

export default class AnotherDecisionHelper extends DecisionHelper {
  formFromPost(req: Request): DecisionForm {
    const { selectedDecisionId } = req.body
    return {
      selectedDecisionId,
      selectedDecisionData: {
        anotherNameInput: req.body.anotherNameInput,
      },
    }
  }

  override validateForm(form: DecisionForm): FormError[] {
    const anotherData = form.selectedDecisionData as AnotherData
    if (!anotherData.anotherNameInput) {
      return [error.ANOTHER_MISSING_NAME_INPUT]
    }
    return []
  }

  override updatedAnswers(currentAnswers: DecisionAnswers, form: DecisionForm): DecisionAnswers {
    return {
      ...super.updatedAnswers(currentAnswers, form),
      victimAnother: (form.selectedDecisionData as AnotherData).anotherNameInput,
    }
  }
}
