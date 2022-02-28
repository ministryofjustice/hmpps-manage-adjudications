import { codeFromIncidentRole, IncidentRole, incidentRoleFromCode } from './IncidentRole'

describe('radioToIncidentRole', () => {
  it('null radio selection', () => {
    expect(codeFromIncidentRole(null)).toEqual(null)
  })
  it('first radio selected', () => {
    expect(codeFromIncidentRole('committed' as IncidentRole)).toEqual(null)
  })
  it('second radio selected', () => {
    expect(codeFromIncidentRole('attempted' as IncidentRole)).toEqual('25a')
  })
  it('third radio selected', () => {
    expect(codeFromIncidentRole('incited' as IncidentRole)).toEqual('25b')
  })
  it('fourth radio selected', () => {
    expect(codeFromIncidentRole('assisted' as IncidentRole)).toEqual('25c')
  })
})

describe('incidentRoleToRadio', () => {
  it('null incident role', () => {
    expect(incidentRoleFromCode(null)).toEqual('committed')
  })
  it('25a incident role', () => {
    expect(incidentRoleFromCode('25a')).toEqual('attempted')
  })
  it('25b incident role', () => {
    expect(incidentRoleFromCode('25b')).toEqual('incited')
  })
  it('25c incident role', () => {
    expect(incidentRoleFromCode('25c')).toEqual('assisted')
  })
})
