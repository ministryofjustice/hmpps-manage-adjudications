import fs from 'fs'

describe('Package dependencies', () => {
  const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  it('uses redis v4', () => {
    // See here: https://github.com/redis/node-redis/issues/2095 and here for Andy Lee's fix https://github.com/ministryofjustice/hmpps-template-typescript/pull/84
    // eslint-disable-next-line no-useless-escape
    expect(packageData.dependencies.redis).toMatch(/[^\.]4\..*/)
  })
})
