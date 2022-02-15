// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, OfficerData, StaffData } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { properCaseName } from '../../utils/utils'
import UserService from '../../services/userService'

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
    text: 'Enter their first name',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#officerSearchLastNameInput',
    text: 'Enter their last name',
  },
}

export default class OfficerDecisionHelper extends DecisionHelper {
  constructor(private readonly userService: UserService) {
    super()
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): { pathname: string; query: { [key: string]: string } } {
    return {
      pathname: '/select-associated-staff',
      query: {
        staffFirstName: (form.selectedDecisionData as OfficerData).officerSearchFirstNameInput,
        staffLastName: (form.selectedDecisionData as OfficerData).officerSearchLastNameInput,
      },
    }
  }

  override decisionFormFromPost(req: Request): DecisionForm {
    const { selectedDecisionId } = req.body
    return {
      selectedDecisionId,
      selectedDecisionData: {
        officerId: req.body.officerId,
        officerSearchFirstNameInput: req.body.officerSearchFirstNameInput,
        officerSearchLastNameInput: req.body.officerSearchLastNameInput,
      },
    }
  }

  override updatedDecisionForm(form: DecisionForm, redirectData: string): DecisionForm {
    return {
      selectedDecisionId: form.selectedDecisionId,
      selectedDecisionData: {
        officerId: redirectData,
        officerSearchFirstNameInput: (form.selectedDecisionData as OfficerData).officerSearchFirstNameInput,
        officerSearchLastNameInput: (form.selectedDecisionData as OfficerData).officerSearchLastNameInput,
      },
    }
  }

  override validateDecisionForm(form: DecisionForm, req: Request): FormError[] {
    const officerData = form.selectedDecisionData as OfficerData
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

  override async viewDataFromDecisionForm(form: DecisionForm, user: User): Promise<any> {
    const officerId = (form.selectedDecisionData as OfficerData)?.officerId
    if (officerId) {
      const decisionOfficer = await this.userService.getStaffFromUsername(officerId, user)
      return { officerName: properCaseName(decisionOfficer.name) }
    }
    return null
  }
}
