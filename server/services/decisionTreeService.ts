import decisionTree from '../offenceCodeDecisions/DecisionTree'
import { Decision } from '../offenceCodeDecisions/Decision'

export default class DecisionTreeService {
  getDecisionTree(): Decision {
    return decisionTree
  }
}
