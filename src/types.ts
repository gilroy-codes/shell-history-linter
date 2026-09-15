export type Severity = 'error' | 'warning'

export interface HistoryEntry {
  line: number
  raw: string
  command: string
  timestamp?: number
}

export interface Finding {
  line: number
  severity: Severity
  ruleId: string
  message: string
  excerpt: string
}

export interface Rule {
  id: string
  severity: Severity
  description: string
  // returns a message when the entry triggers the rule, null otherwise
  check(entry: HistoryEntry): string | null
}
