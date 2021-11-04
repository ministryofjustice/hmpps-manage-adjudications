import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonLocation, AgencyId } from '../data/PrisonLocationResult'
import logger from '../../logger'

export default class LocationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getIncidentLocations(agencyId: AgencyId, user: User): Promise<PrisonLocation[]> {
    try {
      const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
      const incidentLocations = await new PrisonApiClient(token).getLocations(agencyId)

      const formattedIncidentLocations = incidentLocations.map(location => ({
        ...location,
        userDescription: location.userDescription ? location.userDescription : location.locationPrefix,
      }))

      const prisonersCell = formattedIncidentLocations.find(
        location => location.userDescription.toUpperCase() === "PRISONER'S CELL"
      )
      const otherCell = formattedIncidentLocations.find(
        location => location.userDescription.toUpperCase() === 'OTHER CELL'
      )

      const remainingLocations = formattedIncidentLocations
        .filter(
          location =>
            location.userDescription.toUpperCase() !== 'OTHER CELL' &&
            location.userDescription.toUpperCase() !== "PRISONER'S CELL"
        )
        .sort((a, b) => a.userDescription.localeCompare(b.userDescription, 'en', { ignorePunctuation: true }))

      return [...(prisonersCell ? [prisonersCell] : []), ...(otherCell ? [otherCell] : []), ...remainingLocations]
    } catch (error) {
      logger.error(error, 'Error during getIncidentLocations')
      throw error
    }
  }
}
