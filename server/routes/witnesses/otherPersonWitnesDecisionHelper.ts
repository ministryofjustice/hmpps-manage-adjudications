// All functionality that knows about the prison decision.
import { Request } from 'express'
import { OtherPersonData, DecisionForm } from '../offenceCodeDecisions/decisionForm'
import DecisionHelper from '../offenceCodeDecisions/decisionHelper'
import { FormError } from '../../@types/template'
import DecisionTreeService from '../../services/decisionTreeService'
import { properCaseName } from '../../utils/utils'

// eslint-disable-next-line no-shadow
enum ErrorType {
  OTHER_PERSON_NAME = 'OTHER_PERSON_NAME',
}
const error: { [key in ErrorType]: FormError } = {
  OTHER_PERSON_NAME: {
    href: '#otherPersonNameInput',
    text: 'Enter the person’s first and last names',
  },
}

const prepareWitnessName = (otherPersonNameInput: string) => {
  const trimmedName = otherPersonNameInput.trim().replace(/ +/g, ' ')
  return trimmedName.split(' ')
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
        otherPersonNameInput: req.body.otherPersonNameInput,
      },
    }
  }

  override async validateForm(form: DecisionForm): Promise<FormError[]> {
    const otherPersonData = form.selectedAnswerData as OtherPersonData
    const errors = []
    const names = prepareWitnessName(otherPersonData.otherPersonNameInput)
    if (!otherPersonData.otherPersonNameInput || names.length < 2) {
      errors.push(error.OTHER_PERSON_NAME)
    }
    return errors
  }

  override async witnessNamesForSession(form: DecisionForm): Promise<unknown> {
    const { otherPersonNameInput } = form.selectedAnswerData as OtherPersonData
    if (otherPersonNameInput) {
      const names = prepareWitnessName(otherPersonNameInput)
      return {
        firstName: properCaseName(names[0]),
        lastName: properCaseName(names.reverse()[0]),
      }
    }
    return {}
  }
}
