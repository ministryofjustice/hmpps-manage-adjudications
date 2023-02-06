import { FormError } from '../../../@types/template'

type pleaAndFindingForm = {
  hearingPlea: string
  hearingFinding: string
}

const errors: { [key: string]: FormError } = {
  MISSING_PLEA: {
    href: '#hearingPlea',
    text: 'Select a plea',
  },
  MISSING_FINDING: {
    href: '#hearingFinding',
    text: 'Select a finding',
  },
}

export default function validateForm({ hearingPlea, hearingFinding }: pleaAndFindingForm): FormError | null {
  if (!hearingPlea) {
    return errors.MISSING_PLEA
  }
  if (!hearingFinding) {
    return errors.MISSING_FINDING
  }

  return null
}
