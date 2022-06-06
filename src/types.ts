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

export type ProgressEvent = {
  total: number
  loaded: number
  percent: string
}

export interface IDownloadOption {
  url: string
  dir: string
  onComplete: (filePath: string) => void
  onError: (error: AxiosError | Error) => void
  onProgress?: (progressEvent: ProgressEvent) => void
}

export interface IPackOpition {
  name: string
  description: string
  action: Array<string>
  type: 'command' | 'app'
  cmd: string | Array<string>
  downloadUrl: string | Array<Array<string>>
}

export type IListrContext = {
  text: string
  tmpdir: string
  tasks: Array<IPackOpition>
  filePaths: Map<string, string>
}
