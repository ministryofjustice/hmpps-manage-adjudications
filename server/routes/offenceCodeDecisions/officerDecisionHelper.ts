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
  OFFICER_MISSING_ID_SUBMIT = 'OFFICER_MISSING_ID_SUBMIT',
}
const error: { [key in ErrorType]: FormError } = {
  // We have separated out the submit and search validation messages here
  OFFICER_MISSING_ID_SUBMIT: {
    href: '#selectedAnswerId',
    text: 'Search for a prison officer',
  },
  OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchFirstNameInput',
    text: 'Enter the person’s first name',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchLastNameInput',
    text: 'Enter the person’s last name',
  },
  OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH: {
    href: '#officerSearchFirstNameInput',
    text: 'Enter the person’s first name',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#officerSearchLastNameInput',
    text: 'Enter the person’s last name',
  },
}

export default class OfficerDecisionHelper extends DecisionHelper {
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

  override async validateForm(form: DecisionForm, req: Request): Promise<FormError[]> {
    const officerData = form.selectedAnswerData as OfficerData
    const searching = !!req.body.searchUser
    if (searching) {
      return this.validateSearch(officerData)
    }
    if (!officerData.officerId && !searching) {
      return this.validateSubmission(officerData)
    }
    return []
  }

  validateSearch = (officerData: OfficerData) => {
    const searchingErrors = []
    if (!officerData.officerSearchFirstNameInput) {
      searchingErrors.push(error.OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH)
    }
    if (!officerData.officerSearchLastNameInput) {
      searchingErrors.push(error.OFFICER_MISSING_LAST_NAME_INPUT_SEARCH)
    }
    return searchingErrors
  }

  validateSubmission = (officerData: OfficerData) => {
    const submittingErrors = []
    if (!officerData.officerSearchFirstNameInput) {
      submittingErrors.push(error.OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT)
    }
    if (!officerData.officerSearchLastNameInput) {
      submittingErrors.push(error.OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT)
    }
    if (officerData.officerSearchFirstNameInput && officerData.officerSearchLastNameInput) {
      submittingErrors.push(error.OFFICER_MISSING_ID_SUBMIT)
    }
    return submittingErrors
  }

  override async viewDataFromForm(form: DecisionForm, user: User): Promise<unknown> {
    const officerId = (form.selectedAnswerData as OfficerData)?.officerId
    if (officerId) {
      const decisionOfficer = await this.userService.getStaffFromUsername(officerId, user)
      return { officerName: convertToTitleCase(decisionOfficer.name) }
    }
    return null
  }

  override async witnessNamesForSession(form: DecisionForm, user: User): Promise<unknown> {
    const officerId = (form.selectedAnswerData as OfficerData)?.officerId
    if (officerId) {
      const decisionOfficer = await this.userService.getStaffFromUsername(officerId, user)
      const officerName = convertToTitleCase(decisionOfficer.name).split(' ')
      return {
        firstName: officerName[0],
        lastName: officerName[1],
      }
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
