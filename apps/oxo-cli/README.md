@eventuras/oxo
=================

Eventuras CLI tools


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@eventuras/oxo.svg)](https://npmjs.org/package/@eventuras/oxo)
[![Downloads/week](https://img.shields.io/npm/dw/@eventuras/oxo.svg)](https://npmjs.org/package/@eventuras/oxo)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @eventuras/oxo
$ oxo COMMAND
running command...
$ oxo (--version)
@eventuras/oxo/0.0.1 darwin-arm64 node-v24.10.0
$ oxo --help [COMMAND]
USAGE
  $ oxo COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oxo hello PERSON`](#oxo-hello-person)
* [`oxo hello world`](#oxo-hello-world)
* [`oxo help [COMMAND]`](#oxo-help-command)
* [`oxo plugins`](#oxo-plugins)
* [`oxo plugins add PLUGIN`](#oxo-plugins-add-plugin)
* [`oxo plugins:inspect PLUGIN...`](#oxo-pluginsinspect-plugin)
* [`oxo plugins install PLUGIN`](#oxo-plugins-install-plugin)
* [`oxo plugins link PATH`](#oxo-plugins-link-path)
* [`oxo plugins remove [PLUGIN]`](#oxo-plugins-remove-plugin)
* [`oxo plugins reset`](#oxo-plugins-reset)
* [`oxo plugins uninstall [PLUGIN]`](#oxo-plugins-uninstall-plugin)
* [`oxo plugins unlink [PLUGIN]`](#oxo-plugins-unlink-plugin)
* [`oxo plugins update`](#oxo-plugins-update)

## `oxo hello PERSON`

Say hello

```
USAGE
  $ oxo hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oxo hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/losol/eventuras/blob/v0.0.1/src/commands/hello/index.ts)_

## `oxo hello world`

Say hello world

```
USAGE
  $ oxo hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oxo hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/losol/eventuras/blob/v0.0.1/src/commands/hello/world.ts)_

## `oxo help [COMMAND]`

Display help for oxo.

```
USAGE
  $ oxo help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for oxo.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.33/src/commands/help.ts)_

## `oxo plugins`

List installed plugins.

```
USAGE
  $ oxo plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ oxo plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/index.ts)_

## `oxo plugins add PLUGIN`

Installs a plugin into oxo.

```
USAGE
  $ oxo plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into oxo.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the OXO_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the OXO_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ oxo plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ oxo plugins add myplugin

  Install a plugin from a github url.

    $ oxo plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ oxo plugins add someuser/someplugin
```

## `oxo plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ oxo plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ oxo plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/inspect.ts)_

## `oxo plugins install PLUGIN`

Installs a plugin into oxo.

```
USAGE
  $ oxo plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into oxo.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the OXO_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the OXO_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ oxo plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ oxo plugins install myplugin

  Install a plugin from a github url.

    $ oxo plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ oxo plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/install.ts)_

## `oxo plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ oxo plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ oxo plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/link.ts)_

## `oxo plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oxo plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oxo plugins unlink
  $ oxo plugins remove

EXAMPLES
  $ oxo plugins remove myplugin
```

## `oxo plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ oxo plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/reset.ts)_

## `oxo plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oxo plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oxo plugins unlink
  $ oxo plugins remove

EXAMPLES
  $ oxo plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/uninstall.ts)_

## `oxo plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oxo plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oxo plugins unlink
  $ oxo plugins remove

EXAMPLES
  $ oxo plugins unlink myplugin
```

## `oxo plugins update`

Update installed plugins.

```
USAGE
  $ oxo plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.50/src/commands/plugins/update.ts)_
<!-- commandsstop -->
