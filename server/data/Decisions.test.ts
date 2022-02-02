import committed from './Decisions'
import Title from './Title'

describe('tokenStore', () => {
  it('Print out', () => {
    console.log(committed.toString())
    // committed.findByTitle(new Title('What happened?')).forEach(d => console.log(d.toString()))
  })
})
