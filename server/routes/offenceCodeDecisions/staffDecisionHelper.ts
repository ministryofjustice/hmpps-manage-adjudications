// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, StaffData } from './decisionForm'
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
    text: 'Enter the person’s first name',
  },
  STAFF_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#staffSearchLastNameInput',
    text: 'Enter the person’s last name',
  },
}

export default class StaffDecisionHelper extends DecisionHelper {
  constructor(private readonly userService: UserService, readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): {
    pathname: string
    query: { [key: string]: string }
  } {
    return {
      pathname: adjudicationUrls.selectAssociatedStaff.root,
      query: {
        staffFirstName: (form.selectedAnswerData as StaffData).staffSearchFirstNameInput,
        staffLastName: (form.selectedAnswerData as StaffData).staffSearchLastNameInput,
      },
    }
  }

  override formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        staffId: req.body.staffId,
        staffSearchFirstNameInput: req.body.staffSearchFirstNameInput,
        staffSearchLastNameInput: req.body.staffSearchLastNameInput,
      },
    }
  }

  override formAfterSearch(selectedAnswerId: string, selectedPerson: string): DecisionForm {
    return {
      selectedAnswerId,
      selectedAnswerData: {
        staffId: selectedPerson,
      },
    }
  }

  override async validateForm(form: DecisionForm, req: Request): Promise<FormError[]> {
    const staffData = form.selectedAnswerData as StaffData
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
    const staffId = (form.selectedAnswerData as StaffData)?.staffId
    if (staffId) {
      const decisionStaff = await this.userService.getStaffFromUsername(staffId, user)
      return { staffName: convertToTitleCase(decisionStaff.name) }
    }
    return null
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      victimStaffUsername: (form.selectedAnswerData as StaffData).staffId,
    }
  }
}
