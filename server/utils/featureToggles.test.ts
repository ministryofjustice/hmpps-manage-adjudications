import config from '../config'
import { featureTogglesFor, isMultiPrivilegePunishmentsEnabled } from './featureToggles'

describe('isMultiPrivilegePunishmentsEnabled', () => {
  const original = config.featureToggles.multiPrivilegePunishmentsPrisons

  afterEach(() => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = original
  })

  it('is off everywhere when no prisons are listed', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = []
    expect(isMultiPrivilegePunishmentsEnabled('MDI')).toBe(false)
  })

  it('is on for every prison when ALL is listed', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
    expect(isMultiPrivilegePunishmentsEnabled('MDI')).toBe(true)
    expect(isMultiPrivilegePunishmentsEnabled(undefined)).toBe(true)
  })

  it('is on only for listed prisons', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['LEI', 'MDI']
    expect(isMultiPrivilegePunishmentsEnabled('MDI')).toBe(true)
    expect(isMultiPrivilegePunishmentsEnabled('BMI')).toBe(false)
  })

  it('ignores case and surrounding spaces in the caseload id', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['MDI']
    expect(isMultiPrivilegePunishmentsEnabled(' mdi ')).toBe(true)
  })

  it('is off when the user has no active caseload', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['MDI']
    expect(isMultiPrivilegePunishmentsEnabled(undefined)).toBe(false)
  })

  it('builds the toggles object for templates', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = ['MDI']
    expect(featureTogglesFor('MDI')).toEqual({ multiPrivilegePunishments: true })
  })
})
