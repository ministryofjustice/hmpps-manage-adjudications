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
    text: 'Enter details about these damages',
  },
  RADIO_OPTION_MISSING: {
    href: '#evidenceType',
    text: 'Select what needs to be done',
  },
  BWC_IDENTIFIER_MISSING: {
    href: '#bwcEvidenceIdentifier',
    text: 'xxxxx',
  },
  BAT_IDENTIFIER_MISSING: {
    href: '#batEvidenceIdentifier',
    text: 'xxxxx',
  },
}

export default function validateForm({
  evidenceDescription,
  evidenceType,
  bwcIdentifier,
  batIdentifier,
}: addEvidenceForm): FormError | null {
  if (!evidenceType) return errors.RADIO_OPTION_MISSING
  if (evidenceType === 'bodyWornCamera' && !bwcIdentifier) return errors.BWC_IDENTIFIER_MISSING
  if (evidenceType === 'baggedAndTagged' && !batIdentifier) return errors.BAT_IDENTIFIER_MISSING
  if (!evidenceDescription) return errors.MISSING_TEXT

  return null
}
