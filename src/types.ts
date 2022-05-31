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
