import { AxiosError } from 'axios'

export interface IGist {
  id: string
  url: string
  files: {
    [key: string]: {
      type: string
      size: number
      raw_url: string
      filename: string
    }
  }
}

export interface IDownloadOption {
  url: string
  dir: string
  fileName: string
  onError: (error: AxiosError) => void
  onComplete: (filePath: string) => void
  onProgress: (chunk: Buffer, size: number) => void
}
