export interface IPackOpition {
  name: string
  alias?: string
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
