import { HistoryEntry } from './types'

// zsh with `setopt EXTENDED_HISTORY` writes ": <epoch>:<elapsed>;<command>"
// instead of the bare command that bash and plain zsh history use.
const EXTENDED_LINE = /^: (\d+):(\d+);(.*)$/

export function parseHistory(contents: string): HistoryEntry[] {
  const lines = contents.split('\n')
  const entries: HistoryEntry[] = []

  lines.forEach((raw, index) => {
    if (raw.length === 0) {
      return
    }

    const line = index + 1
    const match = EXTENDED_LINE.exec(raw)

    if (match) {
      entries.push({
        line,
        raw,
        command: match[3],
        timestamp: Number(match[1]),
      })
    } else {
      entries.push({ line, raw, command: raw })
    }
  })

  return entries
}
