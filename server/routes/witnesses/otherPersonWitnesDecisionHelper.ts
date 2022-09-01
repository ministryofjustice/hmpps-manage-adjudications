// All functionality that knows about the prison decision.
import { Request } from 'express'
import { OtherPersonData, DecisionForm } from '../offenceCodeDecisions/decisionForm'
import DecisionHelper from '../offenceCodeDecisions/decisionHelper'
import { FormError } from '../../@types/template'
import DecisionTreeService from '../../services/decisionTreeService'
import { properCase } from '../../utils/utils'

// eslint-disable-next-line no-shadow
enum ErrorType {
  OTHER_PERSON_MISSING_FIRST_NAME_INPUT_SUBMIT = 'OTHER_PERSON_MISSING_FIRST_NAME_INPUT_SUBMIT',
  OTHER_PERSON_MISSING_LAST_NAME_INPUT_SUBMIT = 'OTHER_PERSON_MISSING_LAST_NAME_INPUT_SUBMIT',
}
const error: { [key in ErrorType]: FormError } = {
  OTHER_PERSON_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#otherPersonFirstNameInput',
    text: 'Enter the person’s first name',
  },
  OTHER_PERSON_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#otherPersonLastNameInput',
    text: 'Enter the person’s last name',
  },
}

export default class OtherPersonWitnessDecisionHelper extends DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        otherPersonFirstNameInput: req.body.otherPersonFirstNameInput,
        otherPersonLastNameInput: req.body.otherPersonLastNameInput,
      },
    }
  }

  override async validateForm(form: DecisionForm): Promise<FormError[]> {
    const otherPersonData = form.selectedAnswerData as OtherPersonData
    const errors = []
    if (!otherPersonData.otherPersonFirstNameInput) {
      errors.push(error.OTHER_PERSON_MISSING_FIRST_NAME_INPUT_SUBMIT)
    }
    if (!otherPersonData.otherPersonLastNameInput) {
      errors.push(error.OTHER_PERSON_MISSING_LAST_NAME_INPUT_SUBMIT)
    }
    return errors
  }

  override async witnessNamesForSession(form: DecisionForm): Promise<unknown> {
    const { otherPersonFirstNameInput, otherPersonLastNameInput } = form.selectedAnswerData as OtherPersonData
    if (otherPersonFirstNameInput && otherPersonLastNameInput) {
      return {
        firstName: properCase(otherPersonFirstNameInput),
        lastName: properCase(otherPersonLastNameInput),
      }
    }
    return null
  }
}
