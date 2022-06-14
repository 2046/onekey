import path from 'path'
import * as utils from '../../src/bin/utils'

describe('cli utils', () => {
  test('parse yaml content to object', () => {
    expect(
      utils.parse(`
    - type: app
      name: onekey`)
    ).toEqual([
      {
        type: 'app',
        name: 'onekey'
      }
    ])
  })

  test('parse yaml content to empty object', () => {
    expect(utils.parse('')).toEqual({})

    expect(
      utils.parse(`
    \tfoo: 1
    bar: 2
   `)
    ).toEqual({})
  })

  test('file extname is .pack', () => {
    expect(utils.isPackFile('/Users/home/app.pack')).toBeTruthy()
    expect(utils.isPackFile('/Users/home/app.zip')).toBeFalsy()
    expect(utils.isPackFile('https://example.com/app.pack')).toBeTruthy()
    expect(utils.isPackFile('https://example.com/app.zip')).toBeFalsy()
  })

  test('task type is app', () => {
    expect(
      utils.isAppType({
        type: 'app',
        cmd: '',
        name: '',
        action: [],
        description: '',
        downloadUrl: ''
      })
    ).toBeTruthy()
  })

  test('task type is command', () => {
    expect(
      utils.isCommandType({
        type: 'command',
        cmd: '',
        name: '',
        action: [],
        description: '',
        downloadUrl: ''
      })
    ).toBeTruthy()
  })

  test('link is mac apple store', () => {
    expect(utils.isMasUrl('/Users/home/app.zip')).toBeFalsy()
    expect(utils.isMasUrl('https://example.com/en/about/')).toBeFalsy()
    expect(utils.isMasUrl('https://apps.apple.com/cn/app/swift-playgrounds/id1496833156')).toBeTruthy()
  })

  test('text is hash code', () => {
    expect(
      utils.isHashCode(`
    - type: app
      name: onekey`)
    ).toBeFalsy()
    expect(utils.isHashCode('4acdfee2bbc0b7313e5041e877')).toBeTruthy()
  })

  test('config file is gist file', () => {
    expect(utils.isGistFile('name')).toBeFalsy()
    expect(utils.isGistFile('name/gistname')).toBeTruthy()
    expect(utils.isGistFile('name/gistname/')).toBeFalsy()
  })

  test('config file is local file', () => {
    expect(utils.isLocallyFile(path.join(process.cwd(), 'examples/apps.zip'))).toBeFalsy()
    expect(utils.isLocallyFile(path.join(process.cwd(), 'examples/apps.pack'))).toBeTruthy()
  })

  test('config file is remote file', () => {
    expect(utils.isRemotelyFile('/Users/home/app.zip')).toBeFalsy()
    expect(utils.isRemotelyFile('http://example.com/app.pack')).toBeTruthy()
    expect(utils.isRemotelyFile('https://example.com/app.pack')).toBeTruthy()
  })

  test('resolve mac apple store link', () => {
    expect(utils.resolveMasUrl('/Users/home/app.zip')).toBe('')
    expect(utils.resolveMasUrl('https://example.com')).toBe('')
    expect(utils.resolveMasUrl('https://example.com/en/about/')).toBe('')
    expect(utils.resolveMasUrl('https://apps.apple.com/cn/app/swift-playgrounds/id1496833156')).toBe('1496833156')
  })

  test('data encrypt & decrypt', () => {
    const data = 'hello world'
    const password = '123456'
    const encryptData = '1b68b3120ff997a47f53666fa28b04cb'

    expect(utils.encrypt(data, password)).toBe(encryptData)
    expect(utils.decrypt(encryptData, password)).toBe(data)
  })
})
