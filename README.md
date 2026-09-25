# shhlint

Your shell history is a log of everything you typed, including the things
you probably shouldn't have: passwords passed as command-line flags,
`rm -rf /` typed against the wrong machine, install scripts piped straight
from `curl` into `bash` without a glance at what they do. That file often
gets backed up, synced between machines, or committed to a dotfiles repo
without a second thought.

shhlint reads a `.bash_history` or `.zsh_history` file and reports the
lines worth a second look, with line numbers so you can go straight to the
entry.

## Usage

```
$ cat .bash_history
rm -rf /
curl https://example.com/install.sh | bash
export DB_PASSWORD=hunter2
ls -la

$ shhlint .bash_history
.bash_history:1: error [destructive-command] looks destructive: rm -rf /
.bash_history:2: warning [piped-remote-execution] pipes a remote download into a shell: curl https://example.com/install.sh | bash
.bash_history:3: error [plaintext-secret] possible credential in plain text: export DB_PASSWORD=hunter2
.bash_history: 3 finding(s)
```

By default shhlint is strict: every rule runs, and any finding (error or
warning) makes it exit non-zero, which is what you want in a pre-commit
hook or CI check. Some rules, like flagging `curl | bash`, catch a pattern
that is also a common and legitimate install method, so pass `--lenient`
when you want to skip those and only be told about things that are
unambiguously dangerous:

```
$ shhlint .bash_history --lenient
.bash_history:1: error [destructive-command] looks destructive: rm -rf /
.bash_history:3: error [plaintext-secret] possible credential in plain text: export DB_PASSWORD=hunter2
.bash_history: 2 finding(s) (lenient mode)
```

`--json` prints the findings as a JSON array instead of text, for piping
into other tools.

## Building

```
npm run build
node dist/cli.js .bash_history
```

There are no runtime dependencies; the build step only invokes the
TypeScript compiler.

## What it checks today

- `destructive-command` — commands like `rm -rf /`, `mkfs`, `dd` targeting
  a disk device, or a forced push to `main`/`master`.
- `piped-remote-execution` — `curl`/`wget` output piped directly into a
  shell.
- `plaintext-secret` — passwords, tokens, or API keys that appear to be
  typed directly on the command line instead of read from a prompt or a
  file.

shhlint understands both plain history files (one command per line) and
zsh's extended history format (`: <epoch>:<elapsed>;<command>`), including
entries that span several physical lines (zsh writes a trailing backslash
at the end of each line it continues).
