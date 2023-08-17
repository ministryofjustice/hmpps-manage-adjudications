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
  it('shows error when no punishment option selected - damages previously added', () => {
    expect(
      validateForm({
        punishmentType: null,
        damagesAlreadyAdded: true,
      })
    ).toEqual({
      href: '#punishmentType',
      text: 'Select a punishment',
    })
  })
  it('shows error when no punishment option selected - damages not previously added', () => {
    expect(
      validateForm({
        punishmentType: null,
        damagesAlreadyAdded: false,
      })
    ).toEqual({
      href: '#punishmentType',
      text: 'Select a punishment or recovery of money for damages',
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
      text: 'Enter the percentage of earnings to be stopped',
    })
  })
  it('shows error when stoppage percentage is more than 100', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.EARNINGS,
        stoppagePercentage: 101,
      })
    ).toEqual({
      href: '#stoppagePercentage',
      text: 'Enter a number between 0 and 100',
    })
  })
  it('shows error when stoppage percentage is less than 1', () => {
    expect(
      validateForm({
        punishmentType: PunishmentType.EARNINGS,
        stoppagePercentage: -3,
      })
    ).toEqual({
      href: '#stoppagePercentage',
      text: 'Enter a number between 0 and 100',
    })
  })
})
