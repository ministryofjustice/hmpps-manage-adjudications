import CuriousApiClient from '../data/curiousApiClient'
import log from '../log'

const applicableNeurodiversitiesForReportLowercase = [
  'visual impairment',
  'hearing impairment',
  'moderate learning difficulty',
  'severe learning difficulty',
  'dyslexia',
  'speech, language and communication needs',
]

function combineNeurodiversities(profile: LearnerProfile): Array<string> {
  if (!profile.primaryLDDAndHealthProblem) {
    return profile.additionalLDDAndHealthProblems
  }
  return [profile.primaryLDDAndHealthProblem, ...profile.additionalLDDAndHealthProblems]
}

export default class CuriousApiService {
  async getNeurodiversitiesForReport(prisonerNumber: string, token: string): Promise<string[] | null> {
    try {
      const learnerProfiles = await new CuriousApiClient(token).getLearnerProfiles(prisonerNumber)

      const listedNeurodiversities = learnerProfiles
        .map(profile => combineNeurodiversities(profile))
        .reduce((accumulator, neurodiversities) => accumulator.concat(neurodiversities), [])
      const uniqueListedNeurodiversities = Array.from(new Set(listedNeurodiversities))

      return uniqueListedNeurodiversities.filter(neurodiversity =>
        applicableNeurodiversitiesForReportLowercase.includes(neurodiversity.toLowerCase()),
      )
    } catch (err) {
      if (err.response?.status === 404) {
        // Expected
        return null
      }
      // Log the error and continue
      log.error(`Failed to get neurodiversities. Reason: ${err.message}`, err)
    }
    return null
  }
}
