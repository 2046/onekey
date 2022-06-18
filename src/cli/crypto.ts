import { encrypt, decrypt, isPackFile, loadFile } from './utils'

export default {
  async encrypt(filePath: string, password: string) {
    if (!isPackFile(filePath)) {
      throw new Error('The file format is incorrect, please use the .pack file format.')
    }

    return encrypt(await loadFile(filePath), password)
  },
  async decrypt(filePath: string, password: string) {
    if (!isPackFile(filePath)) {
      throw new Error('The file format is incorrect, please use the .pack file format.')
    }

    return decrypt(await loadFile(filePath), password)
  }
}
