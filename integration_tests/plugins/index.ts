import { resetStubs } from '../mockApis/wiremock'
import prisonApi from '../mockApis/prisonApi'
import { CaseLoad } from '../../server/data/prisonApiClient'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: (caseLoads: CaseLoad[]) => Promise.all([auth.stubSignIn(), prisonApi.stubUserCaseloads(caseLoads)]),

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,
  })
}
