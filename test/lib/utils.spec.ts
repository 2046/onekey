import { lstat } from 'fs/promises'
import * as utils from '../../src/lib/utils'

describe('lib utils', () => {
  test('cp command', async () => {
    const tmpdir = await utils.tmpdir()

    expect(utils.cp(tmpdir, `${tmpdir}bak`)).toBe(`${tmpdir}bak`)
  })

  test('which command', () => {
    expect(utils.which('echo')).toBeTruthy()
    expect(utils.which('hello')).toBeFalsy()
  })

  test('exec command', () => {
    const { stderr, stdout } = utils.exec('echo "hello"')

    expect(stdout.trim()).toBe('hello')
    expect(stderr).toBe('')
  })

  test('constants', () => {
    expect(utils.MAS_PKG_URL).not.toBeNull()
    expect(utils.isAppleCPU).toBeTruthy()
  })

  test('to Int', () => {
    expect(utils.toInt('')).toBe(0)
    expect(utils.toInt('10')).toBe(10)
  })

  test('ext name', () => {
    expect(utils.extName('test.zip')).toBe('.zip')
    expect(utils.extName('1287239339')).toBe('.mas')
    expect(utils.extName('id1287239339')).toBe('')
  })

  test('tmpdir', async () => {
    const tmpdir = await utils.tmpdir()
    expect((await lstat(tmpdir)).isDirectory()).toBeTruthy()
  })

  test('isInstalled', async () => {
    expect(await utils.isInstalled('Safari')).toBeTruthy()
    expect(await utils.isInstalled('git')).toBeTruthy()
    expect(await utils.isInstalled('hello')).toBeFalsy()
  })

  test('pkgutil pkgs', () => {
    expect(Array.isArray(utils.pkgutil.pkgs())).toBeTruthy()
  })

  test('pkgutil pkgInfo', () => {
    const pkgInfo = utils.pkgutil.pkgInfo(utils.pkgutil.pkgs()[0])

    expect(pkgInfo.pkgid).toBe(utils.pkgutil.pkgs()[0])
    expect(pkgInfo['install-time']).not.toBeUndefined()
  })

  test('pkgutil files', () => {
    const files = utils.pkgutil.files(utils.pkgutil.pkgs()[0])

    expect(Array.isArray(files)).toBeTruthy()
  })

  test('memoize', () => {
    const add = (a: number, b: number) => a + b

    expect(utils.memoize(add, 1, 2)).toBe(3)
    expect(utils.memoize(add, 1, 2)).toBe(3)
  })
})
