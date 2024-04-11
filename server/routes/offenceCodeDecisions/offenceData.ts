// Data retained while progressing through the questions to decide and offenceCode. At the end of the decisions when
// we have an offence code the data here should be enough to uniquely determine the questions and answers given.
export type OffenceData = {
  victimStaffUsername?: string
  victimPrisonersNumber?: string
  victimOtherPersonsName?: string
  offenceCode?: string
}

export enum ProtectedCharacteristicsTypes {
  AGE = 'AGE',
  DISABILITY = 'DISABILITY',
  GENDER_REASSIGN = 'GENDER_REASSIGN',
  MARRIAGE_AND_CP = 'MARRIAGE_AND_CP',
  PREGNANCY_AND_MAT = 'PREGNANCY_AND_MAT',
  RACE = 'RACE',
  RELIGION = 'RELIGION',
  SEX = 'SEX',
  SEX_ORIENTATION = 'SEX_ORIENTATION',
}
