import axios from 'axios'
import { join } from 'path'
import { toInt } from './utils'
import { createWriteStream } from 'fs'
import { IDownloadOption } from './types'

export default function download(options: IDownloadOption) {
  axios
    .get<NodeJS.ReadableStream>(options.url, { responseType: 'stream' })
    .then((res) => {
      const size = toInt(res.headers['content-length'])
      const filePath = join(options.dir, options.fileName)

      res.data.on('data', (chunk: Buffer) => options.onProgress(chunk, size))
      res.data.on('end', () => options.onComplete(filePath))

      res.data.pipe(createWriteStream(filePath))
    })
    .catch(options.onError)
}
