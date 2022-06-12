import axios from 'axios'
import { toInt } from './utils'
import { createWriteStream } from 'fs'
import { join, basename, extname } from 'path'

export type ProgressEvent = {
  total: number
  loaded: number
  percent: string
}

export default function download(options: {
  url: string
  dir: string
  onProgress?: (progressEvent: ProgressEvent) => void
}) {
  return new Promise<string>((resolve, reject) => {
    const fileName = basename(options.url)

    if (!extname(fileName)) {
      return reject(new Error('The download url format is invalid, must contain the ext name'))
    }

    axios
      .get<NodeJS.ReadableStream>(options.url, { responseType: 'stream' })
      .then((res, loaded = 0) => {
        const destPath = join(options.dir, fileName)
        const total = toInt(res.headers['content-length'])

        if (options.onProgress) {
          res.data.on('data', (chunk: Buffer) => {
            loaded = loaded + chunk.length

            // @ts-ignore
            options.onProgress({
              total,
              loaded,
              percent: Math.floor(Math.min(Math.max(loaded / total, 0), 1) * 100).toFixed(0)
            })
          })
        }

        res.data.on('end', () => resolve(destPath))
        res.data.pipe(createWriteStream(destPath))
      })
      .catch((error) => reject(error))
  })
}
