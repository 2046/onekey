# OneKey - one key install apps & system settings

Install the applications and system settings needed for a new system with one click, get the system into working condition quickly.

## Feature

- Configuration file encryption
- Support macos system `dmg` `pkg` `zip` file type
- Supports installation of apps purchased from the Mac App Store

## Quickly

Install the app using a script that automatically installs Node.js.

```bash
/bin/bash -c "$(curl -fsSL https://onekey.dev/install)" [filePath] [password]
```

## Installation

```bash
npm install -g onekey
```

## Command line flags

```bash
npx -y onekey [filePath] [password] [tools]
```

- **`filePath`**: configuration file address, support `local file` or `remote url` or `Github gist`.
- **`password`**: secret key, if the configuration file is encrypted, it needs to be decrypted using the secret key.
- **`tools`**: encrypt & decrypt tools, encrypt algorithm: `aes-256-cbc`.
  - use `-e` to encrypt configuration files.
  - use `-d` to decrypt configuration files.

## Usage

### Normal

```bash
onekey <local file>.pack
onekey <https:// url>.pack
onekey <github username>/<gist name>.pack
```

### Recommended

Use the `npx` command to omit the installation step.

```bash
npx -y onekey <local file>.pack
npx -y onekey <https:// url>.pack
npx -y onekey <github username>/<gist name>.pack
```

### Advanced

Using an encrypted configuration file secures the data, but you must enter the correct secret key when using it.

```bash
npx -y onekey <local file>.pack <password>
npx -y onekey <https:// url>.pack <password>
npx -y onekey <github username>/<gist name>.pack <password>
```

Use encrypt & decrypt tools

```bash
npx -y onekey <local file>.pack <password> -e # encrypt local file
npx -y onekey <https:// url>.pack <password> -e # encrypt remote file
npx -y onekey <github username>/<gist name>.pack <password> -e # encrypt gist file
#==> hash code

npx -y onekey <local file>.pack <password> -d # decrypt local file
npx -y onekey <https:// url>.pack <password> -d # decrypt remote file
npx -y onekey <github username>/<gist name>.pack <password> -d # decrypt gist file
#==> yaml code
```

## Configuration file content

The contents of the configuration file use `YAML` syntax, and the file extension must be `.pack`.

### Note ⚠️

**The `name` field identifies the application and is used to determine if the application is installed, so please use the correct application name.**

### Syntax

```yml
- type: # operation type, app or command type
  name: # application name, only works if type is app
  alias: # application alias, for applications with non-English name, not required
  downloadUrl: # application install link, in the case of mac os, you can also specify the link for the intel and arm versions separately
  action: # action after application downloaded, usually install
  description: # command description, only works if type is command
  cmd: # command to be executed, can be one or more command, only works if type is command
```

### Example

```yml
- type: app
  name: Notion
  downloadUrl:
    - - intel
      - 'https://desktop-release.notion-static.com/Notion-2.0.23.dmg'
    - - arm
      - 'https://desktop-release.notion-static.com/Notion-2.1.0-arm64.dmg'
  action:
    - install
- type: app
  name: Spectacle
  downloadUrl: 'https://cdn.javis.cloud/apps/Spectacle%2B1.2.zip'
  action:
    - install
- type: app
  name: ColorSlurp
  downloadUrl: 'https://apps.apple.com/cn/app/id1287239339'
  action:
    - install
```

```yml
- type: command
  description: Turn dock auto hide on
  cmd: defaults write com.apple.dock autohide -bool true
- type: command
  description: Remove dock show delay
  cmd:
    - defaults write com.apple.dock autohide-delay -float 0
    - defaults write com.apple.dock autohide-time-modifier -float 0
```

[Read more](examples/apps.pack).

## License

[MIT](LICENSE).

## References and ideas

- https://github.com/labianchin/dotfiles
- https://macos-defaults.com/
- https://github.com/apptools-lab/AppToolkit
