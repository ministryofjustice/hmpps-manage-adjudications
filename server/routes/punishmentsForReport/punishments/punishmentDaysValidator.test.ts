import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'
import validateForm from './punishmentDaysValidator'

describe('validateForm', () => {
  describe('Social visits validation', () => {
    it.each([
      [PunishmentType.RESTRICTION_OF_SOCIAL_VISITS, 84],
      [PunishmentType.LOSS_OF_SOCIAL_VISITS, 27],
    ])('allows %s at its policy maximum', (punishmentType, duration) => {
      expect(validateForm(punishmentType, duration, false)).toBeNull()
    })

    it.each([
      [PunishmentType.RESTRICTION_OF_SOCIAL_VISITS, 85, 'Restriction of social visits cannot be more than 84 days'],
      [PunishmentType.LOSS_OF_SOCIAL_VISITS, 28, 'Loss of social visits cannot be more than 27 days'],
    ])('rejects %s above its policy maximum', (punishmentType, duration, text) => {
      expect(validateForm(punishmentType, duration, false)).toEqual({ href: '#duration', text })
    })

    it.each([PunishmentType.RESTRICTION_OF_SOCIAL_VISITS, PunishmentType.LOSS_OF_SOCIAL_VISITS])(
      'rejects %s for a YOI adjudication',
      punishmentType => {
        expect(validateForm(punishmentType, 1, true)).toEqual({
          href: '#duration',
          text: 'Social visits punishments are only available for offences under Adult rules',
        })
      },
    )

    it.each([1.5, Number.NaN])('rejects a non-whole social visits duration: %s', duration => {
      expect(validateForm(PunishmentType.LOSS_OF_SOCIAL_VISITS, duration, false)).toEqual({
        href: '#duration',
        text: 'Enter the number of whole days the social visits punishment will last',
      })
    })
  })

  describe('Additional days validation', () => {
    describe('for adults', () => {
      const IS_YOI = false
      const MAX_DAYS = 84

      it('when valid number of additional days, has no errors', () => {
        expect(validateForm(PunishmentType.ADDITIONAL_DAYS, MAX_DAYS, IS_YOI)).toBeNull()
      })

      it('when additional days above max, returns error', () => {
        expect(validateForm(PunishmentType.ADDITIONAL_DAYS, MAX_DAYS + 1, IS_YOI)).toEqual({
          href: '#duration',
          text: 'Number of additional days cannot be more than 84 for an offence under Adult rules',
        })
      })
    })

    describe('for YOI', () => {
      const IS_YOI = true
      const MAX_DAYS = 42

      it('when valid number of additional days, has no errors', () => {
        expect(validateForm(PunishmentType.ADDITIONAL_DAYS, MAX_DAYS, IS_YOI)).toBeNull()
      })

      it('when additional days above max, returns error', () => {
        expect(validateForm(PunishmentType.ADDITIONAL_DAYS, MAX_DAYS + 1, IS_YOI)).toEqual({
          href: '#duration',
          text: 'Number of additional days cannot be more than 42 for an offence under YOI rules',
        })
      })
    })
  })

  describe('Prospective additional days validation', () => {
    describe('for adults', () => {
      const IS_YOI = false
      const MAX_DAYS = 84

      it('when valid number of prospective additional days, has no errors', () => {
        expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, MAX_DAYS, IS_YOI)).toBeNull()
      })

      it('when additional days above max, returns error', () => {
        expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, MAX_DAYS + 1, IS_YOI)).toEqual({
          href: '#duration',
          text: 'Number of prospective additional days cannot be more than 84 for an offence under Adult rules',
        })
      })
    })

    describe('for YOI', () => {
      const IS_YOI = true
      const MAX_DAYS = 42

      it('when valid number of additional days, has no errors', () => {
        expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, MAX_DAYS, IS_YOI)).toBeNull()
      })

      it('when additional days above max, returns error', () => {
        expect(validateForm(PunishmentType.PROSPECTIVE_DAYS, MAX_DAYS + 1, IS_YOI)).toEqual({
          href: '#duration',
          text: 'Number of prospective additional days cannot be more than 42 for an offence under YOI rules',
        })
      })
    })
  })

  it('Valid submit has no errors - punishment type earnings for adult', () => {
    expect(validateForm(PunishmentType.EARNINGS, 84, false)).toBeNull()
  })

  it('shows error when earnings days above max for adult', () => {
    expect(validateForm(PunishmentType.EARNINGS, 85, false)).toEqual({
      href: '#duration',
      text: 'Days for stoppage of earnings cannot be more than 84 for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - punishment type earnings for YOI', () => {
    expect(validateForm(PunishmentType.EARNINGS, 42, true)).toBeNull()
  })

  it('shows error when earnings days above max for YOI', () => {
    expect(validateForm(PunishmentType.EARNINGS, 43, true)).toEqual({
      href: '#duration',
      text: 'Days for stoppage of earnings cannot be more than 42 for an offence under YOI rules',
    })
  })

  it('Valid submit has no errors - punishment type exclusion work for adult', () => {
    expect(validateForm(PunishmentType.EXCLUSION_WORK, 21, false)).toBeNull()
  })

  it('shows error when exclusion work days above max for adult', () => {
    expect(validateForm(PunishmentType.EXCLUSION_WORK, 22, false)).toEqual({
      href: '#duration',
      text: 'Days for exclusion from associated work cannot be more than 21 for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - punishment type confinement for adult', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 21, false)).toBeNull()
  })

  it('shows error when confinement days above max for adult', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 22, false)).toEqual({
      href: '#duration',
      text: 'Cellular confinement cannot be more than 21 days for an offence under Adult rules',
    })
  })

  it('Valid submit has no errors - punishment type confinement for YOI', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 10, true)).toBeNull()
  })

  it('shows error when confinement days above max for YOI', () => {
    expect(validateForm(PunishmentType.CONFINEMENT, 11, true)).toEqual({
      href: '#duration',
      text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
    })
  })

  describe('Loss of privileges days validation', () => {
    describe('for adults', () => {
      const IS_YOI = false
      const MAX_DAYS = 84

      it('when valid number, has no errors', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS, IS_YOI, PrivilegeType.CANTEEN)).toBeNull()
      })

      it('when days above max, returns error', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS + 1, IS_YOI, PrivilegeType.CANTEEN)).toEqual({
          href: '#duration',
          text: 'Days for loss of canteen cannot be more than 84 days for an offence under Adult rules',
        })
      })

      it('when days above max and privilege type is Other, error wording is generic', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS + 1, IS_YOI, PrivilegeType.OTHER)).toEqual({
          href: '#duration',
          text: 'Days for loss of privilege cannot be more than 84 days for an offence under Adult rules',
        })
      })
    })

    describe('for YOI', () => {
      const IS_YOI = true
      const MAX_DAYS = 21

      it('when valid number, has no errors', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS, IS_YOI, PrivilegeType.CANTEEN)).toBeNull()
      })

      it('when days above max, returns error', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS + 1, IS_YOI, PrivilegeType.CANTEEN)).toEqual({
          href: '#duration',
          text: 'Days for loss of canteen cannot be more than 21 days for an offence under YOI rules',
        })
      })

      it('when days above max and privilege type is Other, error wording is generic', () => {
        expect(validateForm(PunishmentType.PRIVILEGE, MAX_DAYS + 1, IS_YOI, PrivilegeType.OTHER)).toEqual({
          href: '#duration',
          text: 'Days for loss of privilege cannot be more than 21 days for an offence under YOI rules',
        })
      })
    })
  })

  it('Valid submit has no errors - punishment type removal wing for adult', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 28, false)).toBeNull()
  })

  it('shows error when removal wing above max for adult', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 29, false)).toEqual({
      href: '#duration',
      text: `Days for removal from wing or unit cannot be more than 28 days for an offence under Adult rules`,
    })
  })

  it('Valid submit has no errors - punishment type removal wing for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 21, true)).toBeNull()
  })

  it('shows error when removal wing above max for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_WING, 22, true)).toEqual({
      href: '#duration',
      text: `Days for removal from wing or unit cannot be more than 21 days for an offence under YOI rules`,
    })
  })

  it('Valid submit has no errors - punishment type removal activity for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_ACTIVITY, 21, true)).toBeNull()
  })

  it('shows error when removal activity above max for YOI', () => {
    expect(validateForm(PunishmentType.REMOVAL_ACTIVITY, 22, true)).toEqual({
      href: '#duration',
      text: `Days for removal from activity cannot be more than 21 days for an offence under YOI rules`,
    })
  })

  it('Valid submit has no errors - punishment type extra work for YOI', () => {
    expect(validateForm(PunishmentType.EXTRA_WORK, 21, true)).toBeNull()
  })

  it('shows error when extra work above max for YOI', () => {
    expect(validateForm(PunishmentType.EXTRA_WORK, 22, true)).toEqual({
      href: '#duration',
      text: `Days for extra work cannot be more than 21 days for an offence under YOI rules`,
    })
  })
})
