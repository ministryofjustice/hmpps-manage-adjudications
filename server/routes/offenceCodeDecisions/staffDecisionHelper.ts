// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, StaffData } from './decisionForm'
import { User } from '../../data/hmppsAuthClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { properCaseName } from '../../utils/utils'
import UserService from '../../services/userService'
import { OffenceData } from './offenceData'

// eslint-disable-next-line no-shadow
enum ErrorType {
  STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT = 'STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT',
  STAFF_MISSING_LAST_NAME_INPUT_SUBMIT = 'STAFF_MISSING_LAST_NAME_INPUT_SUBMIT',
  STAFF_MISSING_FIRST_NAME_INPUT_SEARCH = 'STAFF_MISSING_FIRST_NAME_INPUT_SEARCH',
  STAFF_MISSING_LAST_NAME_INPUT_SEARCH = 'STAFF_MISSING_LAST_NAME_INPUT_SEARCH',
}

const error: { [key in ErrorType]: FormError } = {
  STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#staffSearchFirstNameInput',
    text: 'Search for a member of staff',
  },
  STAFF_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#staffSearchLastNameInput',
    text: 'Search for a member of staff',
  },
  STAFF_MISSING_FIRST_NAME_INPUT_SEARCH: {
    href: '#staffSearchFirstNameInput',
    text: 'Enter their first name',
  },
  STAFF_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#staffSearchLastNameInput',
    text: 'Enter their last name',
  },
}

export default class StaffDecisionHelper extends DecisionHelper {
  constructor(private readonly userService: UserService) {
    super()
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): { pathname: string; query: { [key: string]: string } } {
    return {
      pathname: '/select-associated-staff',
      query: {
        staffFirstName: (form.selectedDecisionData as StaffData).staffSearchFirstNameInput,
        staffLastName: (form.selectedDecisionData as StaffData).staffSearchLastNameInput,
      },
    }
  }

  override formFromPost(req: Request): DecisionForm {
    const { selectedDecisionId } = req.body
    return {
      selectedDecisionId,
      selectedDecisionData: {
        staffId: req.body.staffId,
        staffSearchFirstNameInput: req.body.staffSearchFirstNameInput,
        staffSearchLastNameInput: req.body.staffSearchLastNameInput,
      },
    }
  }

  override formAfterSearch(selectedDecisionId: string, selectedPerson: string): DecisionForm {
    return {
      selectedDecisionId,
      selectedDecisionData: {
        staffId: selectedPerson,
      },
    }
  }

  override validateForm(form: DecisionForm, req: Request): FormError[] {
    const staffData = form.selectedDecisionData as StaffData
    const searching = !!req.body.searchUser
    if (searching) {
      const errors = []
      if (!staffData.staffSearchFirstNameInput) {
        errors.push(error.STAFF_MISSING_FIRST_NAME_INPUT_SEARCH)
      }
      if (!staffData.staffSearchLastNameInput) {
        errors.push(error.STAFF_MISSING_LAST_NAME_INPUT_SEARCH)
      }
      return errors
    }
    if (!staffData.staffId && !searching) {
      return [error.STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT, error.STAFF_MISSING_LAST_NAME_INPUT_SUBMIT]
    }
    return []
  }

  override async viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    const staffId = (form.selectedDecisionData as StaffData)?.staffId
    if (staffId) {
      const decisionStaff = await this.userService.getStaffFromUsername(staffId, user)
      return { staffName: properCaseName(decisionStaff.name) }
    }
    return null
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      offenceCode: super.updatedOffenceData(currentAnswers, form).offenceCode,
      victimStaff: (form.selectedDecisionData as StaffData).staffId,
    }
  }
}
