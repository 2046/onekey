import decompress from 'decompress'
import { execute, exec, which, isAppleCPU, Homebrew_DIR } from '../utils'

export default {
  installer: async function (filePath: string, dest: string) {
    try {
      const whoami = exec('whoami').trim()

      if (isAppleCPU) {
        await execute(`
          mkdir -p ${dest}/etc ${dest}/include ${dest}/lib ${dest}/sbin ${dest}/share ${dest}/var ${dest}/opt ${dest}/share/zsh ${dest}/share/zsh/site-functions ${dest}/var/homebrew ${dest}/var/homebrew/linked ${dest}/Cellar ${dest}/Caskroom ${dest}/Frameworks &&
          chmod ug=rwx ${dest}/etc ${dest}/include ${dest}/lib ${dest}/sbin ${dest}/share ${dest}/var ${dest}/opt ${dest}/share/zsh ${dest}/share/zsh/site-functions ${dest}/var/homebrew ${dest}/var/homebrew/linked ${dest}/Cellar ${dest}/Caskroom ${dest}/Frameworks &&
          chmod go-w ${dest}/share/zsh ${dest}/share/zsh/site-functions &&
          chown ${whoami} ${dest}/etc ${dest}/include ${dest}/lib ${dest}/sbin ${dest}/share ${dest}/var ${dest}/opt ${dest}/share/zsh ${dest}/share/zsh/site-functions ${dest}/var/homebrew ${dest}/var/homebrew/linked ${dest}/Cellar ${dest}/Caskroom ${dest}/Frameworks &&
          chgrp admin ${dest}/etc ${dest}/include ${dest}/lib ${dest}/sbin ${dest}/share ${dest}/var ${dest}/opt ${dest}/share/zsh ${dest}/share/zsh/site-functions ${dest}/var/homebrew ${dest}/var/homebrew/linked ${dest}/Cellar ${dest}/Caskroom ${dest}/Frameworks &&
          chown -R ${whoami}:admin ${dest}
      `)

        await decompress(filePath, dest, { strip: 1 })

        await execute(`
          echo '# Set PATH, MANPATH, etc., for Homebrew.' >> /Users/${whoami}/.zprofile &&
          echo 'eval "$(${dest}/bin/brew shellenv)"' >> /Users/${whoami}/.zprofile &&
          eval "$(${dest}/bin/brew shellenv)"
        `)
      } else {
        await execute(`
          chmod u+rwx /usr/local/bin /usr/local/include /usr/local/lib /usr/local/share /usr/local/share/doc /usr/local/share/man /usr/local/share/man/man1 &&
          chmod g+rwx /usr/local/bin /usr/local/include /usr/local/lib /usr/local/share /usr/local/share/doc /usr/local/share/man /usr/local/share/man/man1 &&
          chown ${whoami} /usr/local/bin /usr/local/include /usr/local/lib /usr/local/share /usr/local/share/doc /usr/local/share/man /usr/local/share/man/man1 &&
          chgrp admin /usr/local/bin /usr/local/include /usr/local/lib /usr/local/share /usr/local/share/doc /usr/local/share/man /usr/local/share/man/man1 &&
          mkdir -p /usr/local/etc /usr/local/sbin /usr/local/var /usr/local/opt /usr/local/share/zsh /usr/local/share/zsh/site-functions /usr/local/var/homebrew /usr/local/var/homebrew/linked /usr/local/Cellar /usr/local/Caskroom /usr/local/Frameworks &&
          chmod ug=rwx /usr/local/etc /usr/local/sbin /usr/local/var /usr/local/opt /usr/local/share/zsh /usr/local/share/zsh/site-functions /usr/local/var/homebrew /usr/local/var/homebrew/linked /usr/local/Cellar /usr/local/Caskroom /usr/local/Frameworks &&
          chmod go-w /usr/local/share/zsh /usr/local/share/zsh/site-functions &&
          chown ${whoami} /usr/local/etc /usr/local/sbin /usr/local/var /usr/local/opt /usr/local/share/zsh /usr/local/share/zsh/site-functions /usr/local/var/homebrew /usr/local/var/homebrew/linked /usr/local/Cellar /usr/local/Caskroom /usr/local/Frameworks &&
          chgrp admin /usr/local/etc /usr/local/sbin /usr/local/var /usr/local/opt /usr/local/share/zsh /usr/local/share/zsh/site-functions /usr/local/var/homebrew /usr/local/var/homebrew/linked /usr/local/Cellar /usr/local/Caskroom /usr/local/Frameworks &&
          mkdir -p ${dest} &&
          chown -R ${whoami}:admin ${dest} &&
          mkdir -p /Users/${whoami}/Library/Caches/Homebrew &&
          chmod g+rwx /Users/${whoami}/Library/Caches/Homebrew &&
          chown -R ${whoami} /Users/${whoami}/Library/Caches/Homebrew
      `)

        await decompress(filePath, dest, { strip: 1 })
      }

      return `${dest}/bin/brew`
    } catch (error) {
      throw (<NodeJS.ErrnoException>error).code === 'EEXIST' ? new Error('file already exists') : error
    }
  },
  install: function (filePath: string) {
    const name = getAppName(filePath)
    const brewCommand = getBrewCommand()

    if (!brewCommand) {
      throw new Error('To download the application from Homebrew, you need to install brew first.')
    }

    if (isAlready(name)) {
      return which(name)
    }

    const { stdout = '', stderr, code } = exec(filePath.replace('brew', brewCommand))

    if (code === 0 && stdout !== '') {
      return which(name)
    } else {
      throw new Error(stderr)
    }
  }
}

function getAppName(filePath: string) {
  return filePath.replace('brew install', '').trim()
}

function isAlready(name: string) {
  const { code } = exec(`brew list ${name}`)

  return code === 0
}

function getBrewCommand() {
  if (which('brew')) {
    return which('brew')
  } else if (which(`${Homebrew_DIR}/bin/brew`)) {
    return which(`${Homebrew_DIR}/bin/brew`)
  } else {
    return ''
  }
}
