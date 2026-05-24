import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Schema-audit: parses the latest Dexie schema version's index list and
 * scans the codebase for db.<table>.where/orderBy/sortBy('field') calls
 * that reference fields not declared in the index. Catches the recurring
 * "KeyPath X on object store Y is not indexed" runtime crash class.
 */

const SRC_ROOT = resolve(__dirname, '..')

function readSchemaIndexes(): Record<string, { fields: Set<string>; compound: Set<string> }> {
  const schema = readFileSync(resolve(SRC_ROOT, 'db/schema.ts'), 'utf8')

  // Find every .version(N).stores({...}) — keep the LAST one (highest version).
  // A simple regex over the schema text works because the file's hand-authored
  // and the stores object is shallow (single line per table).
  const versionBlocks = [...schema.matchAll(/\.version\((\d+)\)[\s\S]*?\.stores\(\{([\s\S]*?)\}\)/g)]
  expect(versionBlocks.length).toBeGreaterThan(0)

  // Pick the highest-numbered version — that's the live schema.
  const latest = versionBlocks
    .map((m) => ({ v: Number(m[1]), body: m[2] }))
    .sort((a, b) => b.v - a.v)[0]

  const tables: Record<string, { fields: Set<string>; compound: Set<string> }> = {}
  // Each entry looks like:   tableName: 'id, foo, bar, [a+b]',
  const lineRe = /^\s*([a-zA-Z_][\w]*)\s*:\s*['"]([^'"]*)['"]/gm
  for (const m of latest.body.matchAll(lineRe)) {
    const name = m[1]
    const indexSpec = m[2]
    const fields = new Set<string>()
    const compound = new Set<string>()
    for (const raw of indexSpec.split(',').map((s) => s.trim()).filter(Boolean)) {
      if (raw.startsWith('[') && raw.endsWith(']')) {
        // [a+b] compound — store the normalized key.
        compound.add(raw.slice(1, -1).split('+').map((p) => p.trim()).sort().join('+'))
        continue
      }
      // Strip Dexie modifiers: ++ (auto-inc PK), & (unique), * (multiEntry).
      const cleaned = raw.replace(/^[+*&]+/, '')
      if (cleaned) fields.add(cleaned)
    }
    tables[name] = { fields, compound }
  }
  return tables
}

function walkSrc(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'test') continue
      walkSrc(full, out)
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

interface Violation {
  file: string
  line: number
  table: string
  method: string
  field: string
  reason: string
}

function auditFile(
  path: string,
  schema: Record<string, { fields: Set<string>; compound: Set<string> }>,
): Violation[] {
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n')
  const violations: Violation[] = []

  // Match db.<table>.<method>('field')  — single-field where/orderBy/sortBy.
  const singleRe = /\bdb\.([a-zA-Z_]\w*)\.(where|orderBy|sortBy)\(\s*['"]([^'"]+)['"]\s*\)/g
  // Match db.<table>.where({ a: ..., b: ... }) — compound where via object.
  const compoundRe = /\bdb\.([a-zA-Z_]\w*)\.where\(\s*\{([^}]+)\}\s*\)/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const m of line.matchAll(singleRe)) {
      const [, table, method, field] = m
      const spec = schema[table]
      if (!spec) continue // not a known dexie table — skip
      if (!spec.fields.has(field)) {
        violations.push({
          file: path,
          line: i + 1,
          table,
          method,
          field,
          reason: `field "${field}" not in [${[...spec.fields].join(', ')}]`,
        })
      }
    }
    for (const m of line.matchAll(compoundRe)) {
      const [, table, body] = m
      const spec = schema[table]
      if (!spec) continue
      const keys = [...body.matchAll(/([a-zA-Z_]\w*)\s*:/g)].map((k) => k[1]).sort()
      if (keys.length < 2) continue // single-key object — treated like .where('k')
      const normalized = keys.join('+')
      if (!spec.compound.has(normalized)) {
        violations.push({
          file: path,
          line: i + 1,
          table,
          method: 'where',
          field: `{${keys.join(', ')}}`,
          reason: `no compound index [${keys.join('+')}] (declare it in schema or .filter() the second key)`,
        })
      }
    }
  }
  return violations
}

describe('Dexie schema audit', () => {
  const schema = readSchemaIndexes()
  const files = walkSrc(SRC_ROOT)

  it('parses at least the known core tables from the latest schema version', () => {
    for (const t of ['exercises', 'sessions', 'setLogs', 'bodyweight', 'settings']) {
      expect(schema[t], `table ${t} missing from latest schema version`).toBeTruthy()
    }
  })

  it('finds source files to audit', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  it('every db.<table>.where/orderBy/sortBy("field") references an indexed field', () => {
    const violations = files.flatMap((f) => auditFile(f, schema))
    if (violations.length > 0) {
      const msg = violations
        .map(
          (v) =>
            `  ${v.file.replace(SRC_ROOT, 'src')}:${v.line}  db.${v.table}.${v.method}(${v.field})  — ${v.reason}`,
        )
        .join('\n')
      throw new Error(
        `Found ${violations.length} Dexie query/index mismatches that will crash at runtime:\n${msg}`,
      )
    }
  })
})
