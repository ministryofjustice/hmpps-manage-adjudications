// All functionality that knows about the prison decision.
import { Request } from 'express'
import { OtherPersonData, DecisionForm } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'

// eslint-disable-next-line no-shadow
enum ErrorType {
  OTHER_PERSON_MISSING_NAME_INPUT = 'OTHER_PERSON_MISSING_NAME_INPUT',
}
const error: { [key in ErrorType]: FormError } = {
  OTHER_PERSON_MISSING_NAME_INPUT: {
    href: `#otherPersonNameInput`,
    text: 'You must enter a name',
  },
}

export default class OtherPersonDecisionHelper extends DecisionHelper {
  formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        otherPersonNameInput: req.body.otherPersonNameInput,
      },
    }
  }

  override validateForm(form: DecisionForm): FormError[] {
    const otherPersonData = form.selectedAnswerData as OtherPersonData
    if (!otherPersonData.otherPersonNameInput) {
      return [error.OTHER_PERSON_MISSING_NAME_INPUT]
    }
    return []
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      victimOtherPerson: (form.selectedAnswerData as OtherPersonData).otherPersonNameInput,
    }
  }
}
