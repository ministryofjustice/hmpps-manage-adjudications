import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'
import validateForm from './punishmentValidation'

describe('validateForm', () => {
  it('Valid submit has no errors when type only', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.CONFINEMENT,
      })
    ).toBeNull()
  })
  it('Valid submit has no errors when type is privilege', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.ASSOCIATION,
      })
    ).toBeNull()
  })
  it('Valid submit has no errors when type is privilege - other', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'testing',
      })
    ).toBeNull()
  })
  it('Valid submit has no errors when type is earnings', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.EARNINGS,
        stoppagePercentage: 10,
      })
    ).toBeNull()
  })
  it('shows error when no punishment option selected', () => {
    expect(
      validateForm({
        punishmentType: null,
      })
    ).toEqual({
      href: '#punishmentType',
      text: 'Select the type of punishment',
    })
  })
  it('shows error when no privilege option selected', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PRIVILEGE,
      })
    ).toEqual({
      href: '#privilegeType',
      text: 'Select the type of privilege',
    })
  })
  it('shows error when no privilege option other selected', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
      })
    ).toEqual({
      href: '#otherPrivilege',
      text: 'Enter a privilege to be withdrawn',
    })
  })
  it('shows error when stoppage percentage selected', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.EARNINGS,
      })
    ).toEqual({
      href: '#stoppagePercentage',
      text: 'Enter the loss of privileges',
    })
  })
})