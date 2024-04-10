<!-- 
SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
-->

# Jira Version Me

JiraVersionMe provides a [GitHub Action](#github-action), and [Command Line Interface](./docs/cli.md) for managing Jira Versions.


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

          # OPTIONAL: Description associated with the version
          description: 'Product launch milestone'
          # OPTIONAL: Mark the version as "Released"
          release: true
          # OPTIONAL: Assign the following list of issues to the version
          tickets: |
            PIPE-213
            PIPE-214  
```

## Command-line Interface

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
  help [command]           display help for command
```

### Create or Update a Version

```sh
Usage: jira-version-me update [options]

Options:
  -v, --version <version>          The version to create
  -d, --description <description>  The description of the version
  -r, --release                    Mark the version as released
  -h, --help                       display help for command
```

### Assigning tickets to a Version

```sh
Usage: jira-version-me assign [options]

Options:
  -v, --version <version>   The version to assign tickets to
  -t, --ticket <ticket...>  List of JIRA tickets to assign to the specified version
  -h, --help                display help for command
```

## Contributing

If you have suggestions for how jira-version-me could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

- [MIT](./LICENSES/MIT.txt) © 2024 Kevin de Jong \<monkaii@hotmail.com\>
