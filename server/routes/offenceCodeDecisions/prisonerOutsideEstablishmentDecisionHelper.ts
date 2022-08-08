// All functionality that knows about the prisoner-outside-establishment decision.
import { Request } from 'express'
import { PrisonerOutsideEstablishmentData, DecisionForm } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import { User } from '../../data/hmppsAuthClient'

enum ErrorType {
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT = 'PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT',
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT = 'PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT',
  PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER = 'PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER',
  PRISONER_OUTSIDE_ESTABLISHMENT_NUMBER_EXCEEDS_MAXIMUM_SIZE = 'PRISONER_OUTSIDE_ESTABLISHMENT_NUMBER_EXCEEDS_MAXIMUM_SIZE',
}

const PRISON_NUMBER_MAXIMUM_SIZE_IN_DB = 7
const error: { [key in ErrorType]: FormError } = {
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT: {
    href: `#prisonerOutsideEstablishmentNameInput`,
    text: 'Enter the prisoner’s name',
  },
  PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT: {
    href: `#prisonerOutsideEstablishmentNumberInput`,
    text: 'Enter their prison number',
  },
  PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER: {
    href: `#prisonerOutsideEstablishmentNumberInput`,
    text: 'The prison number you have entered does not match a prisoner',
  },
  PRISONER_OUTSIDE_ESTABLISHMENT_NUMBER_EXCEEDS_MAXIMUM_SIZE: {
    href: `#prisonerOutsideEstablishmentNumberInput`,
    text: 'The prison number must not exceed 7 characters',
  },
}

export default class PrisonerOutsideEstablishmentDecisionHelper extends DecisionHelper {
  constructor(
    readonly decisionTreeService: DecisionTreeService,
    readonly prisonerSearchService: PrisonerSearchService
  ) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override async validateForm(form: DecisionForm, req: Request, user: User): Promise<FormError[]> {
    const prisonerOutsideEstablishmentData = form.selectedAnswerData as PrisonerOutsideEstablishmentData
    const errors = []
    if (!prisonerOutsideEstablishmentData.otherPersonNameInput) {
      errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NAME_INPUT)
    }
    if (!prisonerOutsideEstablishmentData.victimPrisonersNumber) {
      errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_MISSING_NUMBER_INPUT)
    } else {
      // eslint-disable-next-line no-lonely-if
      if (prisonerOutsideEstablishmentData.victimPrisonersNumber.length > PRISON_NUMBER_MAXIMUM_SIZE_IN_DB) {
        errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_NUMBER_EXCEEDS_MAXIMUM_SIZE)
      } else {
        const foundPrisoner = await this.prisonerSearchService.isPrisonerNumberValid(
          prisonerOutsideEstablishmentData.victimPrisonersNumber,
          user
        )
        if (!foundPrisoner) {
          errors.push(error.PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER)
        }
      }
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
