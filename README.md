<!-- 
SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
-->

# Jira Version Me

JiraVersionMe provides a [GitHub Action](#github-action), and [Command Line Interface](./docs/cli.md) for managing Jira Versions.
The created releases are sorted based on SemVer 2.0 precedence, allowing you to use JQL for queries such as:

```
project=TEST AND fixVersion >=1.0.0 AND fixVersion <2.0.0
```

> [!WARNING]
> The action expects that the initial versions are already sorted correctly.
>
> If this is not the case, please use the provided [CLI tool to sort your project Versions](#sorting-all-releases).

## GitHub Action

```yaml
name: Jira Release Me
on:
  push:

jobs:
  jira-version-me:
    name: Jira Version Me
    runs-on: ubuntu-latest
    steps:
      - uses: dev-build-deploy/jira-version-me@feat/initial-version
        with:
          # Jira configuration
          jira-url: https://domain.jira.com
          jira-token: ${{ secrets.JIRA_TOKEN }}  # Basic Authorization using Bearer Token (PAT)

          # Project and Version
          project: PIPE
          version: '1.0.0'

          # OPTIONAL: Component name to associate with the provided release (i.e. "framework" leading to "framework/1.0.0")
          component: 'framework'
          # OPTIONAL: Description associated with the version
          description: 'Product launch milestone'
          # OPTIONAL: Mark the version as "Released"
          release: true
          # OPTIONAL: Assign the following list of issues to the version
          tickets: |
            TEST-123
            TEST-456
```

## Command-line Interface

Currently the CLI tool is not distributed as a stand-alone product.
For now, please clone the repository on the expected version and run the binary (`./bin/jira-version-me`) from your local environment.

### Basic usage
```sh
Usage: jira-version-me [options] [command]

Jira Release Management

Options:
  -p, --project <project>  The Jira project key
  -t, --token <token>      The Jira API token
  -u, --url <url>          The Jira URL
  -h, --help               display help for command

Commands:
  update [options]
  assign [options]
  sort
  help [command]           display help for command
```

### Sorting all Releases

```sh
Usage: jira-version-me sort [options]

Options:
  -h, --help  display help for command
```

### Create or Update a Version

```sh
Usage: jira-version-me update [options]

Options:
  -c, --component <component>      The component to update
  -v, --version <version>          The version to create
  -d, --description <description>  The description of the version
  -r, --release                    Mark the version as released
  -h, --help                       display help for command
```

### Assigning tickets to a Version

```sh
Usage: jira-version-me assign [options]

Options:
  -c, --component <component>  The component to update
  -v, --version <version>      The version to assign tickets to
  -t, --ticket <ticket...>     List of JIRA tickets to assign to the specified version
  -h, --help                   display help for command
```

## Contributing

If you have suggestions for how jira-version-me could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

- [MIT](./LICENSES/MIT.txt) © 2024 Kevin de Jong \<monkaii@hotmail.com\>
