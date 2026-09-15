import { Rule } from './types'

// patterns that are close to unrecoverable if run against the wrong target
const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\brm\s+(-\w*r\w*f\w*|-\w*f\w*r\w*)\s+(\/\s*$|\/\s|~\s*$|~\/|\*\s*$)/i,
  /\bmkfs\.\w+\b/,
  /\bdd\s+.*\bof=\/dev\/(disk|sd|hd|nvme)/,
  /\bchmod\s+-R\s+777\s+\//,
  /\bgit\s+push\s+(-f\b|--force\b).*\b(origin\s+)?(main|master)\b/,
]

// fetching a script and handing it straight to a shell skips any chance
// to read what it does first
const REMOTE_EXEC_PATTERN = /\b(curl|wget)\b[^|;\n]*\|\s*(sudo\s+)?\w*sh\b/

// credentials typed on the command line end up in the history file in
// plain text and often get synced or backed up along with it
const SECRET_PATTERNS: RegExp[] = [
  /--?(password|passwd|apikey|api-key|token|secret)[= ]\S+/i,
  /\bAuthorization:\s*Bearer\s+\S+/i,
  /\bexport\s+\w*(KEY|TOKEN|SECRET|PASSWORD)\w*=\S+/,
]

export const rules: Rule[] = [
  {
    id: 'destructive-command',
    severity: 'error',
    description: 'command matches a pattern that can cause irreversible data loss',
    check(entry) {
      for (const pattern of DESTRUCTIVE_PATTERNS) {
        if (pattern.test(entry.command)) {
          return `looks destructive: ${entry.command.trim()}`
        }
      }
      return null
    },
  },
  {
    id: 'piped-remote-execution',
    severity: 'warning',
    description: 'downloads a script and pipes it straight into a shell',
    check(entry) {
      if (REMOTE_EXEC_PATTERN.test(entry.command)) {
        return `pipes a remote download into a shell: ${entry.command.trim()}`
      }
      return null
    },
  },
  {
    id: 'plaintext-secret',
    severity: 'error',
    description: 'a credential appears to be typed directly on the command line',
    check(entry) {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(entry.command)) {
          return `possible credential in plain text: ${entry.command.trim()}`
        }
      }
      return null
    },
  },
]
