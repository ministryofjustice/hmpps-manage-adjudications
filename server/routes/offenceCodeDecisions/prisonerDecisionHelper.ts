// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, PrisonerData } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { formatName } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from './offenceData'

// eslint-disable-next-line no-shadow
enum ErrorType {
  PRISONER_MISSING_NAME_INPUT_SEARCH = 'PRISONER_MISSING_NAME_INPUT_SEARCH',
  PRISONER_MISSING_NAME_INPUT_SUBMIT = 'PRISONER_MISSING_NAME_INPUT_SUBMIT',
}
const error: { [key in ErrorType]: FormError } = {
  PRISONER_MISSING_NAME_INPUT_SEARCH: {
    href: `#prisonerSearchNameInput`,
    text: 'Enter their name or prison number',
  },
  PRISONER_MISSING_NAME_INPUT_SUBMIT: {
    href: `#prisonerSearchNameInput`,
    text: 'Search for a prisoner',
  },
}

export default class PrisonerDecisionHelper extends DecisionHelper {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {
    super()
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): { pathname: string; query: { [key: string]: string } } {
    return {
      pathname: '/select-associated-prisoner',
      query: {
        searchTerm: (form.selectedAnswerData as PrisonerData).prisonerSearchNameInput,
      },
    }
  }

  override formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        prisonerId: req.body.prisonerId,
        prisonerSearchNameInput: req.body.prisonerSearchNameInput,
      },
    }
  }

  override formAfterSearch(selectedAnswerId: string, selectedPerson: string): DecisionForm {
    return {
      selectedAnswerId,
      selectedAnswerData: {
        prisonerId: selectedPerson,
      },
    }
  }

  override validateForm(form: DecisionForm, req: Request): FormError[] {
    const prisonerData = form.selectedAnswerData as PrisonerData
    const searching = !!req.body.searchUser
    if (searching) {
      if (!prisonerData.prisonerSearchNameInput) {
        return [error.PRISONER_MISSING_NAME_INPUT_SEARCH]
      }
    }
    if (!prisonerData.prisonerId && !searching) {
      return [error.PRISONER_MISSING_NAME_INPUT_SUBMIT]
    }
    return []
  }

  override async viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    const prisonerId = (form.selectedAnswerData as PrisonerData)?.prisonerId
    if (prisonerId) {
      const decisionPrisoner = await this.placeOnReportService.getPrisonerDetails(prisonerId, user)
      return { prisonerName: formatName(decisionPrisoner.firstName, decisionPrisoner.lastName) }
    }
    return {}
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      offenceCode: super.updatedOffenceData(currentAnswers, form).offenceCode,
      victimPrisoner: (form.selectedAnswerData as PrisonerData).prisonerId,
    }
  }
}
