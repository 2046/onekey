import { lstat } from 'fs/promises'
import install from '../../src/lib/install'
import download from '../../src/lib/donwload'
import { tmpdir, exec, APP_DIR } from '../../src/lib/utils'

describe('install', () => {
  test('install zip', async () => {
    exec(`rm -rf /${APP_DIR}/AppCleaner.app`)

    const result = await download({
      url: 'http://127.0.0.1:6688/downloads/AppCleaner_3.6.4.zip',
      dir: await tmpdir()
    })

    const filePath = await install({
      dest: APP_DIR,
      appName: 'test',
      filePath: result
    })

    expect((await lstat(filePath)).isDirectory()).toBeTruthy()
  })

  test('install zip exception', async () => {
    const result = await download({
      url: 'http://127.0.0.1:6688/downloads/AppCleaner_3.6.4.zip',
      dir: await tmpdir()
    })

    await expect(async () => {
      await install({
        dest: APP_DIR,
        appName: 'test',
        filePath: result
      })
    }).rejects.toThrow()
  })

  test('install dmg', async () => {
    const result = await download({
      url: 'http://127.0.0.1:6688/ezip/release/MacZip_V2.3.dmg',
      dir: await tmpdir()
    })

    const filePath = await install({
      dest: APP_DIR,
      appName: 'test',
      filePath: result
    })

    expect((await lstat(filePath)).isDirectory()).toBeTruthy()
  }, 20000)

  test('install mas', async () => {
    const filePath = await install({
      dest: APP_DIR,
      appName: 'test',
      filePath: '1287239339'
    })

    expect((await lstat(filePath)).isDirectory()).toBeTruthy()
  })
})
