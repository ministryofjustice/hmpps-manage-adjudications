import {
  numberRange,
  convertToTitleCase,
  formatLocation,
  formatDate,
  formatTimestampToDate,
  getTime,
  getDate,
  hasAnyRole,
  getFormattedOfficerName,
  possessive,
  calculateAge,
  convertNameForPlaceholder,
  convertDateTimeStringToSubmittedDateTime,
  convertSubmittedDateTimeToDateObject,
  getFullDate,
} from './utils'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe('formatLocation()', () => {
  it('should cope with undefined', () => {
    expect(formatLocation(undefined)).toEqual('Unknown')
  })
  it('should cope with null', () => {
    expect(formatLocation(null)).toEqual('Unknown')
  })
  it('should preserve normal location names', () => {
    expect(formatLocation('A1234BC')).toEqual('A1234BC')
  })
  it('should convert CSWAP', () => {
    expect(formatLocation('CSWAP')).not.toEqual('CSWAP')
  })
})

describe('formatDateToISOString', () => {
  it('returns', () => {
    expect(formatDate({ date: '27/10/2021', time: { hour: '13', minute: '30' } })).toEqual('2021-10-27T13:30')
  })
})

describe('hasAnyRole', () => {
  it('returns true when they have one of the required roles', () => {
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], ['ROLE_ONE'])).toEqual(true)
  })
  it('returns false when they have none of the required roles', () => {
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], ['ROLE_THREE', 'ROLE_FOUR'])).toEqual(false)
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], null)).toEqual(false)
  })
  it('returns true if there are no required roles', () => {
    expect(hasAnyRole(null, null)).toEqual(true)
    expect(hasAnyRole(null, ['ROLE_ONE'])).toEqual(true)
  })
})

describe('formatTimestampToDate', () => {
  it('should format timestamp to date', () => {
    expect(formatTimestampToDate('2018-12-23T13:21')).toEqual('23/12/2018')
  })
  it('should format date only timestamp to date', () => {
    expect(formatTimestampToDate('2018-12-23')).toEqual('23/12/2018')
  })
  it('should format timestamp to date using provided format', () => {
    expect(formatTimestampToDate('2018-12-23T13:21', 'DD MMMM YY')).toEqual('23 December 18')
  })
  it('should not fail to parse absent timestamp', () => {
    expect(formatTimestampToDate(undefined)).toEqual(undefined)
  })
})

describe('numberRange', () => {
  it('should be inclusive between two numbers', () => {
    expect(numberRange(1, 3)).toEqual([1, 2, 3])
  })
  it('should return an array with the single element when to and from are the same', () => {
    expect(numberRange(2, 2)).toEqual([2])
  })
  it('should work from zero', () => {
    expect(numberRange(0, 4)).toEqual([0, 1, 2, 3, 4])
  })
  it('should work for negative numbers', () => {
    expect(numberRange(-5, -3)).toEqual([-5, -4, -3])
  })
})

describe('getTime()', () => {
  it('should return the correctly formatted time only', () => {
    expect(getTime('2019-09-23T15:30:00')).toEqual('15:30')
  })

  it('should return Invalid message if invalid string is used', () => {
    expect(getTime('2019-13-23')).toEqual('Invalid date or time')
  })

  it('should return Invalid message if no date time string is used', () => {
    expect(getTime(null)).toEqual('Invalid date or time')
  })
})

describe('getDate()', () => {
  it('should return the correctly formatted date only', () => {
    expect(getDate('2019-09-23T15:30:00')).toEqual('Monday 23 September 2019')
  })

  it('should return Invalid message if invalid string is used', () => {
    expect(getDate('2019-13-23')).toEqual('Invalid date or time')
  })

  it('should return Invalid message if no date time string is used', () => {
    expect(getDate(null)).toEqual('Invalid date or time')
  })
})

describe('getFormattedOfficerName', () => {
  it('should return a correctly formatted name', () => {
    expect(getFormattedOfficerName('Test User')).toEqual('T. User')
  })
  it('should return a correctly formatted name when the surname is double barelled', () => {
    expect(getFormattedOfficerName('Test User-Smith')).toEqual('T. User-Smith')
  })
  it('should return a correctly formatted name when the first name is double barelled', () => {
    expect(getFormattedOfficerName('Test-Jo User')).toEqual('T. User')
  })
  it('should return a correctly formatted name if only one name is added', () => {
    expect(getFormattedOfficerName('smithy')).toEqual('Smithy')
  })
})

describe('convertNameForPlaceholder', () => {
  it('should return a correctly formatted name for pdf', () => {
    expect(convertNameForPlaceholder('Test User', true)).toEqual('T. User')
  })
  it('should return a correctly formatted name not for pdf', () => {
    expect(convertNameForPlaceholder('Test User-Smith', false)).toEqual('Test User-Smith')
  })
})

describe('Possessive', () => {
  it('No string', () => {
    expect(possessive(null)).toEqual('')
  })
  it('Converts name with no S correctly', () => {
    expect(possessive('David Smith')).toEqual('David Smith’s')
  })
  it('Converts name with S correctly', () => {
    expect(possessive('David Jones')).toEqual('David Jones’')
  })
})

describe('calculateAge', () => {
  it('31 years old', () => {
    expect(calculateAge('1990-10-11', '2022-06-14')).toEqual({ years: 31, months: 8 })
  })
  it('18 years old - on birthday', () => {
    expect(calculateAge('2003-10-11', '2021-10-11')).toEqual({ years: 18, months: 0 })
  })
  it('17 years old - day before birthday', () => {
    expect(calculateAge('2003-10-11', '2021-10-10')).toEqual({ years: 17, months: 11 })
  })
})

describe('convertDateTimeStringToSubmittedDateTime', () => {
  it('2021-11-09T10:00:00', () => {
    expect(convertDateTimeStringToSubmittedDateTime('2021-11-09T10:00:00')).toEqual({
      date: '09/11/2021',
      time: { hour: '10', minute: '00' },
    })
  })
  it('null', () => {
    expect(convertDateTimeStringToSubmittedDateTime(null)).toEqual(null)
  })
  it('Invalid', () => {
    expect(convertDateTimeStringToSubmittedDateTime('2021-11T10:00')).toEqual(null)
  })
  it('Undefined', () => {
    expect(convertDateTimeStringToSubmittedDateTime(undefined)).toEqual(null)
  })
})

describe('convertSubmittedDateTimeToDateObject', () => {
  it('Success', () => {
    expect(
      convertSubmittedDateTimeToDateObject({
        date: '09/11/2021',
        time: { hour: '10', minute: '00' },
      })
    ).toEqual({ date: '09/11/2021', hour: '10', minute: '00' })
  })
  it('null', () => {
    expect(convertSubmittedDateTimeToDateObject(null)).toEqual(null)
  })
})

describe('getFullDate', () => {
  test('should return the date in "D MMMM YYYY" format by default', () => {
    const dateTime = '2023-08-24T15:30:00' // Date format is "YYYY-MM-DDTHH:mm:ss"
    const result = getFullDate(dateTime)
    expect(result).toBe('24 August 2023')
  })

  test('should return the date in a custom format when provided', () => {
    const dateTime = '2023-08-24T15:30:00'
    const format = 'MMMM D, YYYY h:mm a' // e.g. "August 24, 2023 3:30 pm"
    const result = getFullDate(dateTime, format)
    expect(result).toBe('August 24, 2023 3:30 pm')
  })

  test('should handle invalid date string gracefully', () => {
    // Depending on the implementation of `getDateOrTime` this might throw an error or return a default value.
    // Adjust the expected result accordingly.
    const result = getFullDate(new Date().toString())
    expect(result).toEqual('Invalid date or time') // assuming it returns 'Invalid date' for invalid inputs.
  })
})
