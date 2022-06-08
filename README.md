# OneKey - one key install apps & system settings

Install the applications and system settings needed for a new system with one click, get the system into working condition quickly.

## Installation

```bash
npm install -g onekey
```

## Command line flags

```bash
npx onekey [filePath] [password] [tools]
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
npx onekey <local file>.pack
npx onekey <https:// url>.pack
npx onekey <github username>/<gist name>.pack
```

### Advanced

Using an encrypted configuration file secures the data, but you must enter the correct secret key when using it.

```bash
npx onekey <local file>.pack <password>
npx onekey <https:// url>.pack <password>
npx onekey <github username>/<gist name>.pack <password>
```

Use encrypt & decrypt tools

```bash
npx onekey <local file>.pack <password> -e # encrypt local file
npx onekey <https:// url>.pack <password> -e # encrypt remote file
npx onekey <github username>/<gist name>.pack <password> -e # encrypt gist file
#==> hash code

npx onekey <local file>.pack <password> -d # decrypt local file
npx onekey <https:// url>.pack <password> -d # decrypt remote file
npx onekey <github username>/<gist name>.pack <password> -d # decrypt gist file
#==> yaml code
```

## Configuration file content

The contents of the configuration file use `YAML` syntax, and the file extension must be `.pack`.

### Syntax

```yml
- type: # operation type, app or command type
  name: # application name, only works if type is app
  downloadUrl: # application install link, in the case of mac os, you can also specify the link for the intel and arm versions separately
  action: # action after application downloaded, usually install
  description: # command description, only works if type is command
  cmd: # command to be executed, can be one or more command, only works if type is command
```

### Example

[Example](examples/apps.pack).

## License

[MIT](LICENSE).
