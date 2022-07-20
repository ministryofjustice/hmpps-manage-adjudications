// All functionality that knows about the prisoner-outside-establishment decision.
import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import DecisionHelper from './decisionHelper'
import { FormError } from '../../@types/template'
import { OffenceData } from './offenceData'
import DecisionTreeService from '../../services/decisionTreeService'

export default class PrisonerOutsideEstablishmentDecisionHelper extends DecisionHelper {
  constructor(readonly decisionTreeService: DecisionTreeService) {
    super(decisionTreeService)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formFromPost(req: Request): DecisionForm {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override validateForm(form: DecisionForm): FormError[] {
    return []
  }

  override updatedOffenceData(currentAnswers: OffenceData, form: DecisionForm): OffenceData {
    return {
      ...super.updatedOffenceData(currentAnswers, form),
    }
  }
}
