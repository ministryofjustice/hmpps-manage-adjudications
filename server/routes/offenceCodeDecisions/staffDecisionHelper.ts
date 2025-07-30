// All functionality that knows about the prison decision.
import { Request } from 'express'
import { DecisionForm, StaffData } from './decisionForm'
import { User } from '../../data/hmppsManageUsersClient'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { convertToTitleCase } from '../../utils/utils'
import UserService from '../../services/userService'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

enum ErrorType {
  STAFF_MISSING_NAME_INPUT_SUBMIT = 'STAFF_MISSING_NAME_INPUT_SUBMIT',
  STAFF_MISSING_NAME_INPUT_SEARCH = 'STAFF_MISSING_NAME_INPUT_SEARCH',
  STAFF_MISSING_ID_SUBMIT = 'STAFF_MISSING_ID_SUBMIT',
}

const error: { [key in ErrorType]: FormError } = {
  // We have separated out the submit and search validation messages here
  STAFF_MISSING_ID_SUBMIT: {
    href: '#selectedAnswerId',
    text: 'Search for a member of staff',
  },
  STAFF_MISSING_NAME_INPUT_SUBMIT: {
    href: '#staffSearchNameInput',
    text: 'Enter the person’s name',
  },
  STAFF_MISSING_NAME_INPUT_SEARCH: {
    href: '#staffSearchNameInput',
    text: 'Enter the person’s name',
  },
}

export default class StaffDecisionHelper extends DecisionHelper {
  constructor(
    private readonly userService: UserService,
    readonly decisionTreeService: DecisionTreeService,
  ) {
    super(decisionTreeService)
  }

  override getRedirectUrlForUserSearch(form: DecisionForm): {
    pathname: string
    query: { [key: string]: string }
  } {
    return {
      pathname: adjudicationUrls.selectAssociatedStaff.root,
      query: {
        staffName: (form.selectedAnswerData as StaffData).staffSearchNameInput,
      },
    }
  }

  override formFromPost(req: Request): DecisionForm {
    const { selectedAnswerId } = req.body
    return {
      selectedAnswerId,
      selectedAnswerData: {
        staffId: req.body.staffId,
        staffSearchNameInput: req.body.staffSearchNameInput,
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
      return this.validateSearch(staffData)
    }
    if (!staffData.staffId && !searching) {
      return this.validateSubmission(staffData)
    }
    return []
  }

  validateSearch = (staffData: StaffData) => {
    const searchingErrors = []
    if (!staffData.staffSearchNameInput) {
      searchingErrors.push(error.STAFF_MISSING_NAME_INPUT_SEARCH)
    }
    return searchingErrors
  }

  validateSubmission = (staffData: StaffData) => {
    const submittingErrors = []
    if (!staffData.staffSearchNameInput) {
      submittingErrors.push(error.STAFF_MISSING_NAME_INPUT_SUBMIT)
    }
    return submittingErrors
  }

  override async viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    const staffId = (form.selectedAnswerData as StaffData)?.staffId
    if (staffId) {
      const decisionStaff = await this.userService.getStaffFromUsername(staffId, user)
      return { staffName: convertToTitleCase(decisionStaff.name) }
    }
    return null
  }

  override async witnessNamesForSession(form: DecisionForm, user: User): Promise<unknown> {
    const staffId = (form.selectedAnswerData as StaffData)?.staffId
    if (staffId) {
      const decisionStaff = await this.userService.getStaffFromUsername(staffId, user)
      const staffName = convertToTitleCase(decisionStaff.name).split(' ')
      return {
        firstName: staffName[0],
        lastName: staffName.slice(1).join(' '),
      }
    }
    return {}
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
      victimStaffUsername: (form.selectedAnswerData as StaffData).staffId,
    }
  }
}
