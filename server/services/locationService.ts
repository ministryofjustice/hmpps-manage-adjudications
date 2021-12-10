import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonLocation, AgencyId, LocationId, Agency } from '../data/PrisonLocationResult'

export default class LocationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getIncidentLocation(locationId: LocationId, user: User): Promise<PrisonLocation> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getLocation(locationId)
  }

  async getAgency(agencyId: AgencyId, user: User): Promise<Agency> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getAgency(agencyId)
  }

  async getIncidentLocations(agencyId: AgencyId, user: User): Promise<PrisonLocation[]> {
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
  }
}
