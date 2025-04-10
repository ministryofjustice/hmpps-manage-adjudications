import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import NomisSyncPrisonerMappingApiClient from '../data/nomisSyncPrisonerMappingApiClient'
import { Location, AgencyId, Agency, IncidentLocation, LocationsApiLocation } from '../data/PrisonLocationResult'
import { User } from '../data/hmppsManageUsersClient'

export default class LocationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

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

  async getCorrespondingNomisLocationId(dpsLocationId: string, user: User): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const location = await new NomisSyncPrisonerMappingApiClient(token).getNomisLocationId(dpsLocationId)
    return location.nomisLocationId
  }

  async getCorrespondingDpsLocationId(nomisLocationId: number, user: User): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const location = await new NomisSyncPrisonerMappingApiClient(token).getDpsLocationId(nomisLocationId)
    return location.dpsLocationId
  }

  async getIncidentLocation(dpsLocationId: string, user: User): Promise<LocationsApiLocation> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new LocationsInsidePrisonApiClient(token).getLocation(dpsLocationId)
  }

  async getIncidentLocations(agencyId: AgencyId, user: User): Promise<IncidentLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const locations = await new LocationsInsidePrisonApiClient(token).getLocations(agencyId)
    // mapping the reponse from locationsApi with that previosuly received from prisonApi
    const incidentLocations = locations.map(loc => ({
      locationId: loc.id, // TODO: MAP-2114: This is currently the Uuid - remove at a later date
      locationUuid: loc.id,
      userDescription: loc.localName,
      locationPrefix: loc.key,
      agencyId: loc.prisonId,
    }))

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

  async getHearingLocations(agencyId: AgencyId, user: User): Promise<IncidentLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const locations = await new LocationsInsidePrisonApiClient(token).getAdjudicationLocations(agencyId)

    const hearingLocations = locations.map(loc => {
      return {
        locationId: loc.id, // TODO: MAP-2114: This is currently the Uuid - remove at a later date
        locationUuid: loc.id,
        userDescription: loc.localName,
        locationPrefix: loc.key,
        agencyId: loc.prisonId,
      }
    })
    const formattedHearingLocations = assignIntLocCodeAsUserDesc(hearingLocations)

    return formattedHearingLocations.sort((a, b) =>
      a.userDescription.localeCompare(b.userDescription, 'en', { ignorePunctuation: true })
    )
  }
}

const assignIntLocCodeAsUserDesc = (locations: IncidentLocation[]) => {
  return locations.map(location => ({
    ...location,
    userDescription: location.userDescription ? location.userDescription : location.locationPrefix,
  }))
}
