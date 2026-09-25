import { HistoryEntry } from './types'

// zsh with `setopt EXTENDED_HISTORY` writes ": <epoch>:<elapsed>;<command>"
// instead of the bare command that bash and plain zsh history use.
const EXTENDED_LINE = /^: (\d+):(\d+);(.*)$/

// zsh writes an embedded newline in a history entry as a trailing backslash
// followed by an actual newline in the file. A backslash only counts as a
// continuation marker if there's an odd number of them at the end of the
// line - "\\\\" is an escaped backslash typed by the user, not a marker.
function endsWithContinuation(command: string): boolean {
  let count = 0
  for (let i = command.length - 1; i >= 0 && command[i] === '\\'; i--) {
    count++
  }
  return count % 2 === 1
}

export function parseHistory(contents: string): HistoryEntry[] {
  const lines = contents.split('\n')
  const entries: HistoryEntry[] = []
  let index = 0

  while (index < lines.length) {
    const raw = lines[index]

    if (raw.length === 0) {
      index++
      continue
    }

    const line = index + 1
    const match = EXTENDED_LINE.exec(raw)
    const timestamp = match ? Number(match[1]) : undefined
    let command = match ? match[3] : raw
    const rawLines = [raw]

    // the shell drops the backslash and the newline entirely when it
    // continues a line, so the two halves are glued together with no
    // separator - any spacing has to already be there in the first half.
    while (endsWithContinuation(command) && index + 1 < lines.length) {
      index++
      const next = lines[index]
      rawLines.push(next)
      command = command.slice(0, -1) + next
    }

    entries.push({
      line,
      raw: rawLines.join('\n'),
      command,
      ...(timestamp !== undefined ? { timestamp } : {}),
    })

    index++
  }

  return entries
}
