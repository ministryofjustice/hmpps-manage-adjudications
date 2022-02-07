import { radioToIncidentRole } from './incidentRoleCode'

describe('radioToIncidentRole', () => {
  it('null radio selection', () => {
    expect(radioToIncidentRole(null)).toEqual(null)
  })
  it('first radio selected', () => {
    expect(radioToIncidentRole('onTheirOwn')).toEqual(null)
  })
  it('second radio selected', () => {
    expect(radioToIncidentRole('attemptOnTheirOwn')).toEqual('25a')
  })
  it('third radio selected', () => {
    expect(radioToIncidentRole('inciteAnotherPrisoner')).toEqual('25b')
  })
  it('fourth radio selected', () => {
    expect(radioToIncidentRole('assistAnotherPrisoner')).toEqual('25c')
  })
})
