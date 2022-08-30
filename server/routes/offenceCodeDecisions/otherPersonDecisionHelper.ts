// All functionality that knows about the prison decision.
import { Request } from 'express'
import { OtherPersonData, DecisionForm } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import { convertToTitleCase } from '../../utils/utils'

// eslint-disable-next-line no-shadow
enum ErrorType {
  OTHER_PERSON_MISSING_NAME_INPUT = 'OTHER_PERSON_MISSING_NAME_INPUT',
  OTHER_PERSON_NAME_INPUT_FORMAT_INCORRECT = 'OTHER_PERSON_NAME_INPUT_FORMAT_INCORRECT',
}
const error: { [key in ErrorType]: FormError } = {
  OTHER_PERSON_MISSING_NAME_INPUT: {
    href: `#otherPersonNameInput`,
    text: 'Enter the person’s name',
  },
  OTHER_PERSON_NAME_INPUT_FORMAT_INCORRECT: {
    href: `#otherPersonNameInput`,
    text: 'Enter the person’s name in the format FIRSTNAME LASTNAME',
  },
}

export default class OtherPersonDecisionHelper extends DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        otherPersonNameInput: req.body.otherPersonNameInput,
      },
    }
  }

  override async validateForm(form: DecisionForm): Promise<FormError[]> {
    const otherPersonData = form.selectedAnswerData as OtherPersonData
    if (!otherPersonData.otherPersonNameInput) {
      return [error.OTHER_PERSON_MISSING_NAME_INPUT]
    }
    if (!otherPersonData.otherPersonNameInput.includes(' ')) {
      return [error.OTHER_PERSON_NAME_INPUT_FORMAT_INCORRECT]
    }
    return []
  }

  override async witnessNamesForSession(form: DecisionForm): Promise<unknown> {
    const { otherPersonNameInput } = form.selectedAnswerData as OtherPersonData
    if (otherPersonNameInput) {
      const otherPersonName = convertToTitleCase(otherPersonNameInput).split(' ')
      return {
        firstName: otherPersonName[0],
        lastName: otherPersonName[1],
      }
    }
    return null
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      victimOtherPersonsName: (form.selectedAnswerData as OtherPersonData).otherPersonNameInput,
    }
  }
}
