import {
  convertToTitleCase,
  formatLocation,
  formatDate,
  formatTimestampToDate,
  formatTimestampToTime,
  hasAnyRole,
  numberRange,
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
    expect(formatLocation(undefined)).toEqual(undefined)
  })
  it('should cope with null', () => {
    expect(formatLocation(null)).toEqual(undefined)
  })
  it('should preserve normal location names', () => {
    expect(formatLocation('A1234BC')).toEqual('A1234BC')
  })
  it('should convert CSWAP', () => {
    expect(formatLocation('CSWAP')).not.toEqual('CSWAP')
  })
})

describe('formatDateToISOString', () => {
  it.only('returns', () => {
    expect(formatDate({ date: '27/10/2021', time: { hour: '13', minute: '30' } })).toEqual('2021-10-27T13:30')
  })
  it('returns error message if any of the inputs are invalid', () => {
    expect(formatDate({ date: '27/10/2021', time: { hour: 'we', minute: 'go' } })).toEqual(null)
    expect(formatDate({ date: 'help', time: { hour: '23', minute: '11' } })).toEqual(null)
  })
})

describe('hasAnyRole', () => {
  it.only('returns true when they have one of the required roles', () => {
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], ['ROLE_ONE'])).toEqual(true)
  })
  it.only('returns false when they have none of the required roles', () => {
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], ['ROLE_THREE', 'ROLE_FOUR'])).toEqual(false)
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], null)).toEqual(false)
  })
  it.only('returns true if there are no required roles', () => {
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
