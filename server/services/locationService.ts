import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import { PrisonLocation, Location, AgencyId, LocationId, Agency } from '../data/PrisonLocationResult'

export default class LocationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getIncidentLocation(locationId: LocationId, user: User): Promise<Location> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getLocation(locationId)
  }

  async getAgency(agencyId: AgencyId, user: User): Promise<Agency> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getAgency(agencyId)
  }

  async getLocationsForUser(user: User): Promise<Location[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const locations = await new PrisonApiClient(token).getUsersLocations()
    // This removes the first entry in the response (which is usually the prison as a whole), we don't need it here
    return locations.filter(loc => loc.locationId > 0)
  }

  async getIncidentLocations(agencyId: AgencyId, user: User): Promise<PrisonLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const incidentLocations = await new PrisonApiClient(token).getLocations(agencyId)

    const formattedIncidentLocations = assignIntLocCodeAsUserDesc(incidentLocations)

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

  async getHearingLocations(agencyId: AgencyId, user: User): Promise<PrisonLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const hearingLocations = await new PrisonApiClient(token).getAdjudicationLocations(agencyId)
    const formattedHearingLocations = assignIntLocCodeAsUserDesc(hearingLocations)

    return formattedHearingLocations.sort((a, b) =>
      a.userDescription.localeCompare(b.userDescription, 'en', { ignorePunctuation: true })
    )
  }
}

const assignIntLocCodeAsUserDesc = (locations: PrisonLocation[]) => {
  return locations.map(location => ({
    ...location,
    userDescription: location.userDescription ? location.userDescription : location.locationPrefix,
  }))
}
