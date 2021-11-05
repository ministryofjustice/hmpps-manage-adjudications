import {
  convertToTitleCase,
  formatLocation,
  formatDate,
  formatTimestampToDate,
  formatTimestampToTime,
  hasAnyRole,
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
    expect(hasAnyRole(['ROLE_ONE', 'ROLE_TWO'], ['ROLE_THREE'])).toEqual(false)
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

describe('formatTimestampToDateTime', () => {
  it('should format timestamp to time', () => {
    expect(formatTimestampToTime('2018-12-23T07:21')).toEqual('07:21')
  })
  it('should format timestamp to time using provided format', () => {
    expect(formatTimestampToTime('2018-12-23T07:21', 'H:mm')).toEqual('7:21')
  })
  it('should not fail to parse absent timestamp', () => {
    expect(formatTimestampToTime(undefined)).toEqual(undefined)
  })
})
