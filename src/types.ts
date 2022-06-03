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
  onComplete: (filePath: string) => void
  onError: (error: AxiosError | Error) => void
  onProgress: (chunk: Buffer, size: number) => void
}

export interface IPackOpition {
  name: string
  action: Array<string>
  type: 'command' | 'app'
  downloadUrl: string | Array<Array<string>>
}
