// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, PrisonerData } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { convertToTitleCase } from '../../utils/utils'
import PlaceOnReportService from '../../services/placeOnReportService'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

// eslint-disable-next-line no-shadow
enum ErrorType {
  PRISONER_MISSING_NAME_INPUT_SEARCH = 'PRISONER_MISSING_NAME_INPUT_SEARCH',
  PRISONER_MISSING_NAME_INPUT_SUBMIT = 'PRISONER_MISSING_NAME_INPUT_SUBMIT',
}
const error: { [key in ErrorType]: FormError } = {
  PRISONER_MISSING_NAME_INPUT_SEARCH: {
    href: `#prisonerSearchNameInput`,
    text: 'Enter the prisoner’s name or prison number',
  },
  PRISONER_MISSING_NAME_INPUT_SUBMIT: {
    href: `#prisonerSearchNameInput`,
    text: 'Search for a prisoner',
  },
}

export default class PrisonerDecisionHelper extends DecisionHelper {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    readonly decisionTreeService: DecisionTreeService
  ) {
    super(decisionTreeService)
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): { pathname: string; query: { [key: string]: string } } {
    return {
      pathname: adjudicationUrls.selectAssociatedPrisoner.root,
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
      return { prisonerName: convertToTitleCase(`${decisionPrisoner.firstName} ${decisionPrisoner.lastName}`) }
    }
    return {}
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      offenceCode: super.updatedOffenceData(currentAnswers, form).offenceCode,
      victimPrisonersNumber: (form.selectedAnswerData as PrisonerData).prisonerId,
    }
  }
}
