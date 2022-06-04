import axios from 'axios'
import { toInt } from './utils'
import { createWriteStream } from 'fs'
import { IDownloadOption } from './types'
import { join, basename, extname } from 'path'

export default function download(options: IDownloadOption) {
  const fileName = basename(options.url)

  if (!extname(fileName)) {
    return options.onError(new Error('The download url format is invalid, must contain the ext name'))
  }

  axios
    .get<NodeJS.ReadableStream>(options.url, { responseType: 'stream' })
    .then((res) => {
      const filePath = join(options.dir, fileName)
      const size = toInt(res.headers['content-length'])

      res.data.on('data', (chunk: Buffer) => options.onProgress(chunk, size))
      res.data.on('end', () => options.onComplete(filePath))

      res.data.pipe(createWriteStream(filePath))
    })
    .catch(options.onError)
}
