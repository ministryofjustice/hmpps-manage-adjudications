import { FormError } from '../../@types/template'

type addEvidenceForm = {
  evidenceType: string
  evidenceDescription: string
  bwcIdentifier: string
  batIdentifier: string
}

const errors: { [key: string]: FormError } = {
  MISSING_TEXT: {
    href: '#evidenceDescription',
    text: 'Enter details about this evidence',
  },
  RADIO_OPTION_MISSING: {
    href: '#evidenceType',
    text: 'Select the type of evidence',
  },
  BWC_IDENTIFIER_MISSING: {
    href: '#bwcIdentifier',
    text: 'Enter the camera number',
  },
  BWC_IDENTIFIER_TOO_LONG: {
    href: '#bwcIdentifier',
    text: 'Camera number must be 15 characters or less',
  },
  BAT_IDENTIFIER_MISSING: {
    href: '#batIdentifier',
    text: 'Enter the seal number',
  },
  BAT_IDENTIFIER_TOO_LONG: {
    href: '#batIdentifier',
    text: 'Seal number must be 32 characters or less',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#evidenceDescription',
    text: 'Your statement must be 4,000 characters or less',
  },
}

export default function validateForm({
  evidenceDescription,
  evidenceType,
  bwcIdentifier,
  batIdentifier,
}: addEvidenceForm): FormError | null {
  if (!evidenceType) return errors.RADIO_OPTION_MISSING
  if (evidenceType === 'BODY_WORN_CAMERA' && !bwcIdentifier) return errors.BWC_IDENTIFIER_MISSING
  if (evidenceType === 'BODY_WORN_CAMERA' && bwcIdentifier.length > 15) return errors.BWC_IDENTIFIER_TOO_LONG
  if (evidenceType === 'BAGGED_AND_TAGGED' && !batIdentifier) return errors.BAT_IDENTIFIER_MISSING
  if (evidenceType === 'BAGGED_AND_TAGGED' && batIdentifier.length > 32) return errors.BAT_IDENTIFIER_TOO_LONG
  if (!evidenceDescription) return errors.MISSING_TEXT
  if (evidenceDescription.length > 4000) return errors.WORD_COUNT_EXCEEDED

  return null
}
