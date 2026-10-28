import config from '../config'

export type FeatureToggles = {
  multiPrivilegePunishments: boolean
}

export const isMultiPrivilegePunishmentsEnabled = (caseLoadId: string): boolean => {
  const prisons = config.featureToggles.multiPrivilegePunishmentsPrisons
  if (prisons.includes('ALL')) {
    return true
  }
  return !!caseLoadId && prisons.includes(caseLoadId.trim().toUpperCase())
}

export const featureTogglesFor = (caseLoadId: string): FeatureToggles => ({
  multiPrivilegePunishments: isMultiPrivilegePunishmentsEnabled(caseLoadId),
})
