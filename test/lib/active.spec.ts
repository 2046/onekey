import active from '../../src/lib/active'

describe('active', () => {
  test('run steps', async () => {
    await active(['echo "hello"', 'echo "world"'])
  })
})
