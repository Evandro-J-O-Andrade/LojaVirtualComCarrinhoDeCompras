DESCRIPTION
  Dumps data or schemas from the remote database.

USAGE
  supabase db dump [flags]

FLAGS
  --dry-run                Prints the pg_dump script that would be executed.
  --data-only              Dumps only data records.
  --use-copy               Use copy statements in place of inserts.
  --exclude, -x string     List of schema.tables to exclude from data-only dump.
  --role-only              Dumps only cluster roles.
  --keep-comments          Keeps commented lines from pg_dump output.
  --file, -f string        File path to save the dumped contents.
  --db-url string          Dumps from the database specified by the connection string (must be percent-encoded).
  --linked                 Dumps from the linked project.
  --local                  Dumps from the local database.
  --project-ref string     Project ref of the Supabase project.
  --password, -p string    Password to your remote Postgres database.
  --schema, -s string      Comma separated list of schema to include.

GLOBAL FLAGS
  --help, -h                                                          Show help information
  --version, -v                                                       Show version information
  --wizard                                                            Start wizard mode for a command
  --completions <bash|zsh|fish|sh>                                    Print shell completion script (choices: bash, zsh, fish, sh)
  --log-level <all|trace|debug|info|warn|warning|error|fatal|none>    Sets the minimum log level (choices: all, trace, debug, info, warn, warning, error, fatal, none)
  --output-format choice                                              Output format: text (default), json, or stream-json (NDJSON) (choices: text, json, stream-json)
  --output, -o choice                                                 output format of status variables (choices: env, pretty, json, toml, yaml, table, csv)
  --profile string                                                    use a specific profile for connecting to Supabase API
  --debug                                                             output debug logs to stderr
  --workdir string                                                    path to a Supabase project directory
  --experimental                                                      enable experimental features
  --network-id string                                                 use the specified docker network instead of a generated one
  --yes                                                               answer yes to all prompts
  --dns-resolver choice                                               lookup domain names using the specified resolver (choices: native, https)
  --create-ticket                                                     create a support ticket for any CLI error
  --agent choice                                                      Override agent detection: yes, no, or auto (default auto) (choices: auto, yes, no)
Unrecognized flag: --schema-only in command supabase db dump
Try rerunning the command with --debug to troubleshoot the error.
