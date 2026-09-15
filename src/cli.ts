#!/usr/bin/env node
import { readFileSync } from 'fs'
import { lint } from './linter'
import { Finding } from './types'

function printUsage(): void {
  console.error('usage: shhlint <history-file> [--lenient] [--json]')
}

function formatFinding(finding: Finding, filePath: string): string {
  return `${filePath}:${finding.line}: ${finding.severity} [${finding.ruleId}] ${finding.message}`
}

function main(argv: string[]): number {
  const args = argv.slice(2)
  const lenient = args.includes('--lenient')
  const json = args.includes('--json')
  const filePath = args.find((arg) => !arg.startsWith('--'))

  if (!filePath) {
    printUsage()
    return 2
  }

  let contents: string
  try {
    contents = readFileSync(filePath, 'utf8')
  } catch (err) {
    console.error(`shhlint: could not read ${filePath}: ${(err as Error).message}`)
    return 2
  }

  const findings = lint(contents, { lenient })
  const suffix = lenient ? ' (lenient mode)' : ''

  if (json) {
    console.log(JSON.stringify(findings, null, 2))
  } else if (findings.length === 0) {
    console.log(`${filePath}: no findings${suffix}`)
  } else {
    for (const finding of findings) {
      console.log(formatFinding(finding, filePath))
    }
    console.log(`${filePath}: ${findings.length} finding(s)${suffix}`)
  }

  return findings.length > 0 ? 1 : 0
}

process.exitCode = main(process.argv)
