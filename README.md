# OneKey - one key install apps

Install the applications needed for a new system with one click, get the system into working condition quickly.

## Installation

```bash
npm install -g onekey
```

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

[Example](example.pack).

## License

[MIT](LICENSE).
