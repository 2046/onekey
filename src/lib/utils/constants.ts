import os from 'os'

export const APP_DIR = '/Applications'
export const isAppleCPU = os.cpus()[0].model.includes('Apple')
export const Homebrew_DIR = isAppleCPU ? '/opt/homebrew' : '/usr/local/Homebrew'
export const MAS_PKG_URL = 'https://cdn.jsdelivr.net/gh/2046/onekey@main/assets/mas-cli-1.8.6.pkg'
