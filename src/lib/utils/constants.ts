import os from 'os'

export const isAppleCPU = os.cpus()[0].model.includes('Apple')
export const Homebrew_DIR = isAppleCPU ? '/opt/homebrew' : '/usr/local/Homebrew'
export const MAS_PKG_URL = 'https://github.com/mas-cli/mas/releases/download/v1.8.6/mas.pkg'
