import path from 'path'
import { readFile } from 'fs/promises'
import crypto from '../../src/bin/crypto'

const originFilePath = path.join(process.cwd(), '/test/fixtures/test.pack')
const cipherFilePath = path.join(process.cwd(), '/test/fixtures/crypto.pack')

describe('crypto tools', () => {
  test('encrypt data', async () => {
    const result = await crypto.encrypt(originFilePath, '123456')
    const cipherText = await readFile(cipherFilePath, 'utf8')

    expect(result).toBe(cipherText.trim())
  })

  test('encrypt data exception', async () => {
    await expect(async () => {
      await crypto.encrypt(originFilePath.replace('.pack', '.zip'), '123456')
    }).rejects.toThrow('The file format is incorrect, please use the .pack file format.')
  })

  test('decrypt data', async () => {
    const result = await crypto.decrypt(cipherFilePath, '123456')
    const originText = await readFile(originFilePath, 'utf8')

    expect(result).toBe(originText.trim())
  })

  test('decrypt data exception', async () => {
    await expect(async () => {
      await crypto.decrypt(cipherFilePath.replace('.pack', '.zip'), '123456')
    }).rejects.toThrow('The file format is incorrect, please use the .pack file format.')
  })
})
