import { lstat } from 'fs/promises'
import download from '../../src/lib/donwload'
import { tmpdir } from '../../src/lib/utils'

describe('donwload', () => {
  test('download file', async () => {
    const result = await download({
      url: 'http://localhost:6688/downloads/AppCleaner_3.6.4.zip',
      dir: await tmpdir()
    })

    expect((await lstat(result)).isFile()).toBeTruthy()
  })

  test('download file onProgress', async () => {
    const mockOnProgress = jest.fn()

    const result = await download({
      url: 'http://localhost:6688/downloads/AppCleaner_3.6.4.zip',
      dir: await tmpdir(),
      onProgress: mockOnProgress
    })

    expect((<Array<{ percent: string }>>mockOnProgress.mock.calls[mockOnProgress.mock.calls.length - 1])[0].percent).toBe('100')
    expect(mockOnProgress.mock.calls.length).not.toBe(0)
    expect((await lstat(result)).isFile()).toBeTruthy()
  })

  test('download file exception', async () => {
    await expect(async () => {
      await download({
        url: 'http://example.com/hello/world',
        dir: await tmpdir()
      })
    }).rejects.toThrow()

    await expect(async () => {
      await download({
        url: 'http://example.com/hello/test.zip',
        dir: await tmpdir()
      })
    }).rejects.toThrow()
  })
})
