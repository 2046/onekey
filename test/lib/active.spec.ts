import active from '../../src/lib/active'

describe('active', () => {
  test('run steps', () => {
    active(['echo "hello"', 'echo "world"'])
  })
})
