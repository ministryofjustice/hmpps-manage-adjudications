// TODO - Re-organise urlgenerator to fit in with this
// TODO - consider search and delete pages - is redirectUrl sufficient?
class Page {
    url: string
}

// Must be shared with other journeys as common code (in this case matches the root route)
class IncidentDetailsPages extends Page {
    offenceCreate: OffenceCreate
}

class SearchForPrisonerToStartReport extends Page {
    selectPrisoner: SelectPrisoner
}

class ContinueReport extends Page {
    taskList: TaskList
}

class TaskList extends Page {
    incidentDetails: IncidentDetailsEdit
    offenceDetails: OffenceDetails
    incidentStatement: IncidentStatement
    checkYourAnswers: CheckYourAnswers
}

class SelectPrisoner extends Page {
    incidentDetailsCreate: IncidentDetailsCreate
}

// Must be shared with other journeys as common code
class IncidentDetailsCreate extends IncidentDetailsPages {
}

class IncidentDetailsEdit extends Page {
    offenceCreate: OffenceCreate
    offenceDetails: OffenceDetails
    taskList: TaskList
}

class OffenceCreate extends Page {
    offenceDetails: OffenceDetails
}

class OffenceDetails extends Page {
    incidentStatement: IncidentStatement
}

class IncidentStatement extends Page {
    checkYourAnswers: CheckYourAnswers
}

class CheckYourAnswers extends Page {
    placedOnReport: PlacedOnReportConfirmed
}

class PlacedOnReportConfirmed extends Page {
    continueReport: ContinueReport
}