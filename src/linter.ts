import { parseHistory } from './parser'
import { rules } from './rules'
import { Finding } from './types'

export interface LintOptions {
  // drop warning-level rules entirely instead of just reporting them;
  // only findings that are genuinely dangerous (severity "error") remain
  lenient?: boolean
}

export function lint(contents: string, options: LintOptions = {}): Finding[] {
  const entries = parseHistory(contents)
  const findings: Finding[] = []

  for (const entry of entries) {
    for (const rule of rules) {
      if (options.lenient && rule.severity === 'warning') {
        continue
      }

      const message = rule.check(entry)
      if (message) {
        findings.push({
          line: entry.line,
          severity: rule.severity,
          ruleId: rule.id,
          message,
          excerpt: entry.command.trim(),
        })
      }
    }
  }

  return findings
}
