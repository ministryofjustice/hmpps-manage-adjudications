// Data retained while progressing through the questions to decide and offenceCode. At the end of the decisions when
// we have an offence code the data here should be enough to uniquely determine the questions and answers given.
export type OffenceData = {
  victimStaffUsername?: string
  victimPrisonersNumber?: string
  victimOtherPersonsName?: string
  offenceCode?: string
  protectedCharacteristics?: string[]
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

export const getProtectedCharacteristicsTypeByIndex = (index: number): ProtectedCharacteristicsTypes => {
  return Object.values(ProtectedCharacteristicsTypes)[index - 1]
}

export const getProtectedCharacteristicsTitle = (pc: ProtectedCharacteristicsTypes): string => {
  switch (pc) {
    case ProtectedCharacteristicsTypes.AGE:
      return 'Age'
    case ProtectedCharacteristicsTypes.DISABILITY:
      return 'Disability'
    case ProtectedCharacteristicsTypes.GENDER_REASSIGN:
      return 'Gender reassignment'
    case ProtectedCharacteristicsTypes.MARRIAGE_AND_CP:
      return 'Marriage and civil partnership'
    case ProtectedCharacteristicsTypes.PREGNANCY_AND_MAT:
      return 'Pregnancy and maternity'
    case ProtectedCharacteristicsTypes.RACE:
      return 'Race'
    case ProtectedCharacteristicsTypes.RELIGION:
      return 'Reglion or belief'
    case ProtectedCharacteristicsTypes.SEX:
      return 'Sex'
    case ProtectedCharacteristicsTypes.SEX_ORIENTATION:
      return 'Sexual orientation'
    default:
      return ''
  }
}
