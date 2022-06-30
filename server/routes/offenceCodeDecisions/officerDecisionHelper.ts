// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, OfficerData } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { convertToTitleCase } from '../../utils/utils'
import UserService from '../../services/userService'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

// eslint-disable-next-line no-shadow
enum ErrorType {
  OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT = 'OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT',
  OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT = 'OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT',
  OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH = 'OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH',
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH = 'OFFICER_MISSING_LAST_NAME_INPUT_SEARCH',
}
const error: { [key in ErrorType]: FormError } = {
  OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchFirstNameInput',
    text: 'Search for a prison officer',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchLastNameInput',
    text: 'Search for a prison officer',
  },
  OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH: {
    href: '#officerSearchFirstNameInput',
    text: 'Enter the prisoner’s first name',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#officerSearchLastNameInput',
    text: 'Enter the prisoner’s last name',
  },
}

export default class OfficerDecisionHelper extends DecisionHelper {
  constructor(private readonly userService: UserService, readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): { pathname: string; query: { [key: string]: string } } {
    return {
      pathname: adjudicationUrls.selectAssociatedStaff.root,
      query: {
        staffFirstName: (form.selectedAnswerData as OfficerData).officerSearchFirstNameInput,
        staffLastName: (form.selectedAnswerData as OfficerData).officerSearchLastNameInput,
      },
    }
  }

  override formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        officerId: req.body.officerId,
        officerSearchFirstNameInput: req.body.officerSearchFirstNameInput,
        officerSearchLastNameInput: req.body.officerSearchLastNameInput,
      },
    }
  }

  override formAfterSearch(selectedAnswerId: string, selectedPerson: string): DecisionForm {
    return {
      selectedAnswerId,
      selectedAnswerData: {
        officerId: selectedPerson,
      },
    }
  }

  override validateForm(form: DecisionForm, req: Request): FormError[] {
    const officerData = form.selectedAnswerData as OfficerData
    const searching = !!req.body.searchUser
    if (searching) {
      const errors = []
      if (!officerData.officerSearchFirstNameInput) {
        errors.push(error.OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH)
      }
      if (!officerData.officerSearchLastNameInput) {
        errors.push(error.OFFICER_MISSING_LAST_NAME_INPUT_SEARCH)
      }
      return errors
    }
    if (!officerData.officerId && !searching) {
      return [error.OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT, error.OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT]
    }
    return []
  }

  override async viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    const officerId = (form.selectedAnswerData as OfficerData)?.officerId
    if (officerId) {
      const decisionOfficer = await this.userService.getStaffFromUsername(officerId, user)
      return { officerName: convertToTitleCase(decisionOfficer.name) }
    }
    return null
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      // Note that we update the victim staff reference here, even though it is an officer. This is because the
      // distinction is purely a UI one and at this point we are using a data structure mirroring the database.
      victimStaffUsername: (form.selectedAnswerData as OfficerData).officerId,
    }
  }
}
