import { prisonerIsInUsersCaseloads } from './caseloadHelper'
import { CaseLoad } from '../data/prisonApiClient'

const caseLoad = (caseLoadId: string, currentlyActive = false): CaseLoad => ({
  caseLoadId,
  description: caseLoadId,
  type: 'INST',
  caseloadFunction: 'TEST',
  currentlyActive,
})

describe('prisonerIsInUsersCaseloads', () => {
  const user = { allCaseLoads: [caseLoad('MDI', true), caseLoad('LEI')] }

  it('allows a prisoner in the users active caseload', () => {
    expect(prisonerIsInUsersCaseloads('MDI', user)).toBe(true)
  })

  it('allows a prisoner in a caseload the user holds but is not currently active in', () => {
    expect(prisonerIsInUsersCaseloads('LEI', user)).toBe(true)
  })

  it('denies a prisoner in a caseload the user does not hold', () => {
    expect(prisonerIsInUsersCaseloads('BXI', user)).toBe(false)
  })

  it('denies a released prisoner with no agency', () => {
    expect(prisonerIsInUsersCaseloads(null, user)).toBe(false)
    expect(prisonerIsInUsersCaseloads('', user)).toBe(false)
  })

  it('denies when the user has no caseloads', () => {
    expect(prisonerIsInUsersCaseloads('MDI', {})).toBe(false)
    expect(prisonerIsInUsersCaseloads('MDI', { allCaseLoads: [] })).toBe(false)
  })
})
