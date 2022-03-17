import { IncidentRole } from '../../incidentRole/IncidentRole'
import { updateDataOnDeleteReturn, updateDataOnSearchReturn } from './incidentDetailsPage'

const originalIncidentDetails = {
  incidentDetails: {
    incidentDate: {
      date: '11-2-2022',
      time: {
        hour: '11',
        minute: '12',
      },
    },
    locationId: 123,
    currentIncidentRoleSelection: IncidentRole.ASSISTED,
    currentAssociatedPrisonerNumber: 'AA1234A',
  },
}

describe('updateDataOnSearchReturn', () => {
  it('should use the search data in the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      selectedPerson: 'CC3456C',
    }
    const updatedIncidentDetails = updateDataOnSearchReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toEqual('CC3456C')
  })
})

describe('updateDataOnDeleteReturn', () => {
  it('should remove the associated prisoner from the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      deleteWanted: 'true',
    }
    const updatedIncidentDetails = updateDataOnDeleteReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toBeNull
  })

  it('should preserve the associated prisoner from the returned incident details', () => {
    const requestData = {
      prisonerNumber: 'BB2345B',
      draftId: 123,
      deleteWanted: 'false',
    }
    const updatedIncidentDetails = updateDataOnDeleteReturn(originalIncidentDetails, requestData)
    expect(updatedIncidentDetails.incidentDetails.currentAssociatedPrisonerNumber).toEqual('AA1234A')
  })
})
