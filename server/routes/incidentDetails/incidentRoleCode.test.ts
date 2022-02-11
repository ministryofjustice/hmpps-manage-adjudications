import { radioToIncidentRole, incidentRoleToRadio } from './incidentRoleCode'

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

describe('incidentRoleToRadio', () => {
  it('null incident role', () => {
    expect(incidentRoleToRadio(null)).toEqual('onTheirOwn')
  })
  it('25a incident role', () => {
    expect(incidentRoleToRadio('25a')).toEqual('attemptOnTheirOwn')
  })
  it('25b incident role', () => {
    expect(incidentRoleToRadio('25b')).toEqual('inciteAnotherPrisoner')
  })
  it('25c incident role', () => {
    expect(incidentRoleToRadio('25c')).toEqual('assistAnotherPrisoner')
  })
})
