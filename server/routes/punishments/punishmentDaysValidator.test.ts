import { convertPrivilegeType, PrivilegeType, PunishmentType } from '../../data/PunishmentResult'
import validateForm from './punishmentDaysValidator'

describe('validateForm', () => {
  it('Valid submit has no errors - punishment type additional days', () => {
    expect(validateForm(PunishmentType.ADDITIONAL_DAYS, 42, false)).toBeNull()
  })

  it('shows error when additional days above max', () => {
    expect(validateForm(PunishmentType.ADDITIONAL_DAYS, 43, false)).toEqual({
      href: '#days',
      text: 'Number of additional days cannot be more than 42',
    })
  })

  it('Valid submit has no errors - punishment type prospective days', () => {
    expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, 42, false)).toBeNull()
  })

  it('shows error when prospective days above max', () => {
    expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, 43, false)).toEqual({
      href: '#days',
      text: 'Number of prospective additional days cannot be more than 42',
    })
  })

  it('Valid submit has no errors - punishment type earnings for adult', () => {
    expect(validateForm(PunishmentType.EARNINGS, 84, false)).toBeNull()
  })

  it('shows error when earnings days above max for adult', () => {
    expect(validateForm(PunishmentType.EARNINGS, 85, false)).toEqual({
      href: '#days',
      text: 'Days for stoppage of earnings cannot be more than 84 for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - punishment type earnings for YOI', () => {
    expect(validateForm(PunishmentType.EARNINGS, 42, true)).toBeNull()
  })

  it('shows error when earnings days above max for YOI', () => {
    expect(validateForm(PunishmentType.EARNINGS, 43, true)).toEqual({
      href: '#days',
      text: 'Days for stoppage of earnings cannot be more than 42 for an offence under YOI rules',
    })
  })

  it('Valid submit has no errors - punishment type exclusion work for adult', () => {
    expect(validateForm(PunishmentType.EXCLUSION_WORK, 21, false)).toBeNull()
  })

  it('shows error when exclusion work days above max for adult', () => {
    expect(validateForm(PunishmentType.EXCLUSION_WORK, 22, false)).toEqual({
      href: '#days',
      text: 'Days for exclusion from associated work cannot be more than 21 for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - confinement type earnings for adult', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 21, false)).toBeNull()
  })

  it('shows error when confinement days above max for adult', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 22, false)).toEqual({
      href: '#days',
      text: 'Cellular confinement cannot be more than 21 days for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - punishment type confinement for YOI', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 10, true)).toBeNull()
  })

  it('shows error when confinement days above max for YOI', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 11, true)).toEqual({
      href: '#days',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })

  it('Valid submit has no errors - privilege type earnings for adult', () => {
    expect(validateForm(PunishmentType.PRIVILEGE, 42, false, PrivilegeType.CANTEEN)).toBeNull()
  })

  it('shows error when privilege days above max for adult', () => {
    expect(validateForm(PunishmentType.PRIVILEGE, 43, false, PrivilegeType.CANTEEN)).toEqual({
      href: '#days',
      text: `Days for loss of ${convertPrivilegeType(
        PrivilegeType.CANTEEN
      )} cannot be more than 42 days for an offence under Adult rules`,
    })
  })

  it('shows error when privilege other days above max for adult', () => {
    expect(validateForm(PunishmentType.PRIVILEGE, 43, false, PrivilegeType.OTHER, 'Chocolate')).toEqual({
      href: '#days',
      text: `Days for loss of Chocolate cannot be more than 42 days for an offence under Adult rules`,
    })
  })

  it('Valid submit has no errors - punishment type privilege for YOI', () => {
    expect(validateForm(PunishmentType.PRIVILEGE, 21, true, PrivilegeType.CANTEEN)).toBeNull()
  })

  it('shows error when privilege days above max for YOI', () => {
    expect(validateForm(PunishmentType.PRIVILEGE, 22, true, PrivilegeType.CANTEEN)).toEqual({
      href: '#days',
      text: `Days for loss of ${convertPrivilegeType(
        PrivilegeType.CANTEEN
      )} cannot be more than 21 days for an offence under YOI rules`,
    })
  })

  it('Valid submit has no errors - punishment type removal wing for adult', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 28, false)).toBeNull()
  })

  it('shows error when removal wing above max for adult', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 29, false)).toEqual({
      href: '#days',
      text: `Days for removal from wing or unit cannot be more than 28 days for an offence under Adult rules`,
    })
  })

  it('Valid submit has no errors - punishment type removal wing for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 21, true)).toBeNull()
  })

  it('shows error when removal wing above max for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 22, true)).toEqual({
      href: '#days',
      text: `Days for removal from wing or unit cannot be more than 21 days for an offence under YOI rules`,
    })
  })

  it('Valid submit has no errors - punishment type removal activity for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_ACTIVITY, 21, true)).toBeNull()
  })

  it('shows error when removal activity above max for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_ACTIVITY, 22, true)).toEqual({
      href: '#days',
      text: `Days for removal from activity cannot be more than 21 days for an offence under YOI rules`,
    })
  })

  it('Valid submit has no errors - punishment type extra work for YOI', () => {
    expect(validateForm(PunishmentType.EXTRA_WORK, 21, true)).toBeNull()
  })

  it('shows error when extra work above max for YOI', () => {
    expect(validateForm(PunishmentType.EXTRA_WORK, 22, true)).toEqual({
      href: '#days',
      text: `Days for extra work cannot be more than 21 days for an offence under YOI rules`,
    })
  })
})
