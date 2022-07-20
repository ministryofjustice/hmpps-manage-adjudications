// All functionality that knows about the prisoner-outside-establishment decision.
import { Request } from 'express'
import { PrisonerOutsideEstablishmentData, DecisionForm } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'

// eslint-disable-next-line no-shadow
enum ErrorType {
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT = 'PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT',
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT = 'PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT',
}
const error: { [key in ErrorType]: FormError } = {
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT: {
    href: `#prisonerOutsideEstablishmentNameInput`,
    text: 'You must enter a name',
  },
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT: {
    href: `#prisonerOutsideEstablishmentNumberInput`,
    text: 'You must enter a prison number',
  },
}

export default class PrisonerOutsideEstablishmentDecisionHelper extends DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        otherPersonNameInput: req.body.prisonerOutsideEstablishmentNameInput,
        victimPrisonersNumber: req.body.prisonerOutsideEstablishmentNumberInput,
      },
    }
  }

  override validateForm(form: DecisionForm): FormError[] {
    const prisonerOutsideEstablishmentData = form.selectedAnswerData as PrisonerOutsideEstablishmentData
    const errors = []
    if (!prisonerOutsideEstablishmentData.otherPersonNameInput) {
      errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT)
    }
    if (!prisonerOutsideEstablishmentData.victimPrisonersNumber) {
      errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT)
    }
    return errors
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      victimOtherPersonsName: (form.selectedAnswerData as PrisonerOutsideEstablishmentData)?.otherPersonNameInput,
      victimPrisonersNumber: (form.selectedAnswerData as PrisonerOutsideEstablishmentData)?.victimPrisonersNumber,
    }
  }
}
