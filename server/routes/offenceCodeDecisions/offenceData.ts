// Data retained while progressing through the questions to decide and offenceCode. At the end of the decisions when
// we have an offence code the data here should be enough to uniquely determine the questions and answers given.
export type OffenceData = {
  victimStaffUsername?: string
  victimPrisonersNumber?: string
  victimOtherPersonsName?: string
  offenceCode?: string
}
