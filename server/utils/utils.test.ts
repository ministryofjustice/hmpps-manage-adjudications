import { convertToTitleCase, formatLocation, formatDate } from './utils'

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
