import committed from './Decisions'
import Code from './Code'

describe('tokenStore', () => {
  it('Print out', () => {
    const s = committed.findById('0:0:0:1')
    const qq = s.questionsTo()

    console.log(s.findByCode(new Code('TODO')).questionsTo())
  })
})
